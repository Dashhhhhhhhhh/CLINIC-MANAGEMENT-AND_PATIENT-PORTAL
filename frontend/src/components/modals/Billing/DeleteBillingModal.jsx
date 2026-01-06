export default function DeleteBillingModal({ show, onClose, onSubmit, selectedBilling }) {
  console.log('Modal component mounted');

  if (!show || !selectedBilling) return null;

  let title = '';
  let message = '';
  let confirmButtonText = '';

  if (selectedBilling.is_deleted === false) {
    title = 'Delete Billing';
    message = 'Are you sure you want to delete this billing record?';
    confirmButtonText = 'Delete';
  } else {
    title = 'Restore Billing';
    message = 'This billing is currently deleted. Restore it?';
    confirmButtonText = 'Restore';
  }

  return (
    <div>
      <h2>{title}</h2>
      {/* Simple message */}
      <p>{message}</p>
      {/*Buttons */}
      <button onClick={onSubmit}>{confirmButtonText}</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
