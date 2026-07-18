import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Kullanım: NETLIFY_DATABASE_URL=... node scripts/create-admin.mjs <username> <password>
// Var olan kullanıcının şifresini de günceller (upsert).
const url = process.env.NETLIFY_DATABASE_URL;
if (!url) { console.error('NETLIFY_DATABASE_URL gerekli'); process.exit(1); }

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Kullanım: node scripts/create-admin.mjs <username> <password>');
  process.exit(1);
}

const sql = postgres(url, { prepare: false });
const hash = await bcrypt.hash(password, 10);
await sql`
  INSERT INTO admin_users (username, password_hash)
  VALUES (${username}, ${hash})
  ON CONFLICT (username)
  DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`;
console.log(`admin kullanıcısı hazır: ${username}`);
await sql.end();
