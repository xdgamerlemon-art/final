import Modal from './Modal.jsx';
import Button from './Button.jsx';
export default function ConfirmModal({ open, title = 'Are you sure?', message, onConfirm, onCancel, busy = false }) { return <Modal open={open} title={title} onClose={onCancel}><p>{message}</p><div className="button-row"><Button variant="ghost" onClick={onCancel}>Cancel</Button><Button variant="danger" disabled={busy} onClick={onConfirm}>{busy ? 'Please wait…' : 'Confirm'}</Button></div></Modal>; }
