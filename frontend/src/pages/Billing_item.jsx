import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import {
  createBillingItem,
  getAllBillingItem,
  getBillingItemsByBillingId,
  updateBillingItem,
  toggleDeleteBillingItem,
} from '../api/billingItem';

function Billing_items() {
  // State Variables

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // fetchAll Variables

  const [billingItems, setBillingItems] = useState([]);

  // navigate variables

  const navigate = useNavigate();

  // Fetch Billing Items (Initial Load)

  useEffect(() => {
    const fetchBillingItems = async () => {
      setLoading(true);
      setSuccessMessage('');
      setError(null);
      try {
        const result = await getAllBillingItem();
        setBillingItems(result.billingItems);
      } catch (error) {
        let errorMessage = '';

        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
          console.error('Backend error:', errorMessage);
        } else if (error.request) {
          errorMessage = 'No response from server';
          console.error('Network error:', errorMessage);
        } else {
          errorMessage = error.message;
          console.error('Unexpected error:', errorMessage);
        }

        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    };
    fetchBillingItems();
  }, []);

  // Param variables

  const { billing_id } = useParams();

  // fetch BillingItems

  const fetchBillingItems = async e => {
    setLoading(true);
    setSuccessMessage('');
    setError(null);
    try {
      const result = await getBillingItemsByBillingId(billing_id);
      setBillingItems(result.data);
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
        console.error('Backend error:', errorMessage);
      } else if (error.request) {
        errorMessage = 'No response from server';
        console.error('Network error:', errorMessage);
      } else {
        errorMessage = error.message;
        console.error('Unexpected error:', errorMessage);
      }

      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billing_id) {
      fetchBillingItems();
    }
  }, [billing_id]);

  if (loading) return <p>Loading Staff...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* ================= Billing Item List ================= */}
      <h2>Billing Item lists</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Billing Item ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Service Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Quantity</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Unit Price</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {billingItems.map(items => (
            <tr key={items.billing_item_id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{items.billing_item_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {items.service?.service_name}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{items.quantity}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{items.unit_price}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{items.subtotal}</td>
            </tr>
          ))}

          <div style={{ marginBottom: '12px' }}>
            <button onClick={() => navigate('/dashboard/billing')} className="btn-back">
              Back to Billing
            </button>
          </div>
        </tbody>
      </table>
    </div>
  );
}
export default Billing_items;
