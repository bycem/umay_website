import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { IMAGE_URL_RE } from '../lib/validation';

interface Slider {
  id: number;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  publish_date: string;
  end_date: string | null;
}

interface SliderFormState {
  title: string;
  description: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
  publish_date: string;
  end_date: string;
}

function toLocalDateTimeInput(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 16);
}

function emptyForm(): SliderFormState {
  return {
    title: '',
    description: '',
    image_url: '',
    sort_order: '0',
    is_active: true,
    publish_date: toLocalDateTimeInput(new Date()),
    end_date: '',
  };
}

function sliderToForm(slider: Slider): SliderFormState {
  return {
    title: slider.title,
    description: slider.description,
    image_url: slider.image_url,
    sort_order: String(slider.sort_order),
    is_active: slider.is_active,
    publish_date: toLocalDateTimeInput(new Date(slider.publish_date)),
    end_date: slider.end_date ? toLocalDateTimeInput(new Date(slider.end_date)) : '',
  };
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function SlidersPage() {
  const { show } = useToast();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SliderFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Slider | null>(null);

  async function loadSliders() {
    setLoading(true);
    try {
      const data = await api.get<{ sliders: Slider[] }>('/api/sliders');
      setSliders(data.sliders);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSliders();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(slider: Slider) {
    setEditingId(slider.id);
    setForm(sliderToForm(slider));
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
    if (!IMAGE_URL_RE.test(form.image_url.trim())) {
      setFormError("Geçerli bir görsel URL'si girin");
      return;
    }

    const payload = {
      title,
      description: form.description,
      image_url: form.image_url.trim(),
      sort_order: Number.parseInt(form.sort_order, 10) || 0,
      is_active: form.is_active,
      publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : new Date().toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    };

    setSaving(true);
    try {
      if (editingId === null) {
        await api.post('/api/sliders', payload);
        show('Slider eklendi');
      } else {
        await api.put(`/api/sliders/${editingId}`, payload);
        show('Slider güncellendi');
      }
      setModalOpen(false);
      await loadSliders();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function moveSlider(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    const reordered = [...sliders];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const ids = reordered.map((s) => s.id);

    try {
      await api.put('/api/sliders/reorder', { ids });
      await loadSliders();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    }
  }

  async function toggleActive(slider: Slider) {
    setTogglingId(slider.id);
    try {
      await api.put(`/api/sliders/${slider.id}`, {
        title: slider.title,
        description: slider.description,
        image_url: slider.image_url,
        sort_order: slider.sort_order,
        is_active: !slider.is_active,
        publish_date: slider.publish_date,
        end_date: slider.end_date,
      });
      show(slider.is_active ? 'Pasife alındı' : 'Aktif edildi');
      await loadSliders();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  function requestDelete(slider: Slider) {
    setDeleteTarget(slider);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.del(`/api/sliders/${deleteTarget.id}`);
      show('Slider silindi');
      await loadSliders();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Bir hata oluştu', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  const imageUrlTrimmed = form.image_url.trim();
  const isImagePreviewValid = IMAGE_URL_RE.test(imageUrlTrimmed);

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
          Slider Yönetimi
        </h1>
        <button type="button" className="btn btn-accent" onClick={openCreateModal}>
          Yeni Slider
        </button>
      </div>

      {loading ? null : sliders.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)' }}>Henüz slider eklenmemiş</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Görsel</th>
              <th>Başlık</th>
              <th>Yayın Tarihi</th>
              <th>Durum</th>
              <th>Sıra</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sliders.map((slider, index) => (
              <tr key={slider.id}>
                <td>
                  <img src={slider.image_url} alt={slider.title} className="image-preview" />
                </td>
                <td>{slider.title}</td>
                <td>
                  {dateFormatter.format(new Date(slider.publish_date))}
                  {slider.end_date && (
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)' }}>
                      bitiş: {dateFormatter.format(new Date(slider.end_date))}
                    </span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={slider.is_active ? 'badge badge-active' : 'badge badge-inactive'}
                    style={{ border: 'none', cursor: 'pointer' }}
                    disabled={togglingId === slider.id}
                    onClick={() => toggleActive(slider)}
                    title={slider.is_active ? 'Pasife al' : 'Aktif et'}
                  >
                    {slider.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px' }}
                      disabled={index === 0}
                      onClick={() => moveSlider(index, -1)}
                      aria-label="Yukarı taşı"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px' }}
                      disabled={index === sliders.length - 1}
                      onClick={() => moveSlider(index, 1)}
                      aria-label="Aşağı taşı"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => openEditModal(slider)}>
                      Düzenle
                    </button>
                    <button type="button" className="btn btn-accent" onClick={() => requestDelete(slider)}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={modalOpen}
        title={editingId === null ? 'Yeni Slider' : 'Slider Düzenle'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="slider-title"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Başlık
            </label>
            <input
              id="slider-title"
              type="text"
              className="form-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="slider-description"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Açıklama
            </label>
            <textarea
              id="slider-description"
              className="form-field"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="slider-image-url"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Görsel URL
            </label>
            <input
              id="slider-image-url"
              type="text"
              className="form-field"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://example.com/gorsel.jpg"
              required
            />
            {imageUrlTrimmed && isImagePreviewValid && (
              <img
                src={imageUrlTrimmed}
                alt="Önizleme"
                className="image-preview"
                style={{ marginTop: 10, width: 160, height: 90 }}
              />
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="slider-sort-order"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Sıra
            </label>
            <input
              id="slider-sort-order"
              type="number"
              className="form-field"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="slider-publish-date"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Yayın Tarihi
            </label>
            <input
              id="slider-publish-date"
              type="datetime-local"
              className="form-field"
              value={form.publish_date}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="slider-end-date"
              style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
            >
              Bitiş Tarihi (opsiyonel)
            </label>
            <input
              id="slider-end-date"
              type="datetime-local"
              className="form-field"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>
              Boş bırakılırsa slider süresiz yayında kalır.
            </p>
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
        message="Bu slider silinsin mi?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
