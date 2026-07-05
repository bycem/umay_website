import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import RichTextEditor from '../components/RichTextEditor';

interface Announcement {
  id: number;
  title: string;
  content: string;
  summary: string;
  publish_date: string;
  is_active: boolean;
}

interface AnnouncementFormState {
  title: string;
  content: string;
  publish_date: string;
  is_active: boolean;
}

const PAGE_SIZE = 10;

function toLocalDateTimeInput(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 16);
}

function emptyForm(): AnnouncementFormState {
  return {
    title: '',
    content: '',
    publish_date: toLocalDateTimeInput(new Date()),
    is_active: true,
  };
}

function announcementToForm(a: Announcement): AnnouncementFormState {
  return {
    title: a.title,
    content: a.content,
    publish_date: toLocalDateTimeInput(new Date(a.publish_date)),
    is_active: a.is_active,
  };
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function AnnouncementsPage() {
  const { show } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AnnouncementFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const data = await api.get<{ announcements: Announcement[]; total: number }>(
        `/api/announcements?limit=${PAGE_SIZE}&offset=${offset}`,
      );
      setAnnouncements(data.announcements);
      setTotal(data.total);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(announcement: Announcement) {
    setEditingId(announcement.id);
    setForm(announcementToForm(announcement));
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    if (!title) {
      setFormError('Başlık zorunludur');
      return;
    }

    const payload = {
      title,
      content: form.content,
      publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : new Date().toISOString(),
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (editingId === null) {
        await api.post('/api/announcements', payload);
        show('Duyuru eklendi');
      } else {
        await api.put(`/api/announcements/${editingId}`, payload);
        show('Duyuru güncellendi');
      }
      setModalOpen(false);
      await loadAnnouncements();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(announcement: Announcement) {
    setTogglingId(announcement.id);
    try {
      await api.put(`/api/announcements/${announcement.id}`, {
        title: announcement.title,
        content: announcement.content,
        publish_date: announcement.publish_date,
        is_active: !announcement.is_active,
      });
      show(announcement.is_active ? 'Pasife alındı' : 'Aktif edildi');
      await loadAnnouncements();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  function requestDelete(announcement: Announcement) {
    setDeleteTarget(announcement);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.del(`/api/announcements/${deleteTarget.id}`);
      show('Duyuru silindi');
      await loadAnnouncements();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  function goPrev() {
    setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
  }

  function goNext() {
    setOffset((prev) => (prev + PAGE_SIZE < total ? prev + PAGE_SIZE : prev));
  }

  const canGoPrev = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--ink)' }}>
          Duyuru Yönetimi
        </h1>
        <button type="button" className="btn btn-accent" onClick={openCreateModal}>
          Yeni Duyuru
        </button>
      </div>

      {loading ? null : announcements.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)' }}>Henüz duyuru yok</p>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Yayın Tarihi</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td>{announcement.title}</td>
                  <td>{dateFormatter.format(new Date(announcement.publish_date))}</td>
                  <td>
                    <button
                      type="button"
                      className={announcement.is_active ? 'badge badge-active' : 'badge badge-inactive'}
                      style={{ border: 'none', cursor: 'pointer' }}
                      disabled={togglingId === announcement.id}
                      onClick={() => toggleActive(announcement)}
                      title={announcement.is_active ? 'Pasife al' : 'Aktif et'}
                    >
                      {announcement.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openEditModal(announcement)}
                      >
                        Düzenle
                      </button>
                      <button type="button" className="btn btn-accent" onClick={() => requestDelete(announcement)}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={goPrev} disabled={!canGoPrev}>
              Önceki
            </button>
            <button type="button" className="btn btn-secondary" onClick={goNext} disabled={!canGoNext}>
              Sonraki
            </button>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        title={editingId === null ? 'Yeni Duyuru' : 'Duyuru Düzenle'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="announcement-title"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Başlık
            </label>
            <input
              id="announcement-title"
              type="text"
              className="form-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              İçerik
            </label>
            <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="announcement-publish-date"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Yayın Tarihi
            </label>
            <input
              id="announcement-publish-date"
              type="datetime-local"
              className="form-field"
              value={form.publish_date}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Aktif
            </label>
          </div>

          {formError && (
            <div style={{ marginBottom: 16, color: 'var(--accent-dark)', fontSize: 14 }}>{formError}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              Kaydet
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        message="Bu duyuru silinsin mi?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
