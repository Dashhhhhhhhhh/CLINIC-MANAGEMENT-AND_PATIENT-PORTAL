export function getPaymentStatusStyle(status) {
  switch (status) {
    case 'paid':
      return { backgroundColor: '#86efac', color: '#14532d' };
    default:
      return { backgroundColor: '#fde047', color: '#854d0e' };
  }
}
