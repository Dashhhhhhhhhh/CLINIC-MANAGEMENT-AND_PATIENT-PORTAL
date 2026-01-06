export default function DeleteResultModel({ isOpen, onClose, onSubmit, selectedResult }) {
  if (!isOpen || !selectedResult) return null;

  let title = '';
  let message = '';
  let confirmButtonText = '';

  if (selectedResult.is_deleted === false) {
    title = 'Delete Result';
    message = 'Are you sure you want to delete this result record?';
    confirmButtonText = 'Delete';
  } else {
    title = 'Restore result';
    message = 'This result is currently deleted. Restore it?';
    confirmButtonText = 'Restore';
  }

  return (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onSubmit}>{confirmButtonText}</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
