export default function UpdateBillingModal({
  show,
  onClose,
  selectedBilling,
  editPaymentStatus,
  setEditPaymentStatus,
  isUpdatingBilling,
  onSubmit,
}) {
  if (!show || !selectedBilling) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Update Billing</h2>

        {/* Payment Status Dropdown */}
        <select value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {/* Buttons */}
        <button onClick={onSubmit} disabled={isUpdatingBilling}>
          {isUpdatingBilling ? 'Updating…' : 'Update'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
