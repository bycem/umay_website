import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} title="Emin misiniz?" onClose={onCancel}>
      <p className="confirm-dialog-message">{message}</p>
      <div className="confirm-dialog-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Vazgeç
        </button>
        <button type="button" className="btn btn-accent" onClick={onConfirm}>
          Sil
        </button>
      </div>
    </Modal>
  );
}
