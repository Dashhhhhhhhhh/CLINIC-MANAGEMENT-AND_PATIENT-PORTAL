export default function FinalizeBillingModal({ show, onClose, selectedBilling, onSubmit }) {
  if (!show || !selectedBilling) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Finalize Billing</h2>

        {/* Simple message */}
        <p>Please confirm you want to finalize this billing record.</p>

        {/* Payment Method Selection (Future improvement)
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="">Select payment method</option>
          <option value="Cash">Cash</option>
          <option value="Gcash">G-Cash</option>
        </select> */}

        {/*Buttons */}
        <button onClick={onSubmit}>Finalize</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
