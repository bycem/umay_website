import postgres from 'postgres';

export const sql = postgres(process.env.NETLIFY_DATABASE_URL!, { prepare: false });
