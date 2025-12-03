import { useState, useEffect } from 'react';
import {
  createBillService,
  getAllBillingService,
  getBillingServiceById,
  updatedBillingService,
  toggleStatusBillingService,
} from '../api/billing_service';

function BillingService() {
  //State Variables

  // fetchAll Variables

  const [billingService, setBillingService] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // handleAdd Variables

  const [addService, setAddService] = useState({
    service_name: '',
    description: '',
    default_price: '0',
    category: '',
  });

  const resetForm = () => {
    setAddService({
      service_name: '',
      description: '',
      default_price: '0',
      category: '',
    });
  };

  const handleAddService = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const result = await createBillService(addService);

      resetForm();
      setSuccessMessage('Billing service created successfully!');
      console.log('Created billing service:', result);
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

  // Fetch Billing service (Initial Load)

  useEffect(() => {
    const fetchBillingService = async () => {
      setLoading(true);
      setSuccessMessage('');
      setError(null);
      try {
        const result = await getAllBillingService();
        setBillingService(result.billingService);
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
    fetchBillingService();
  }, []);

  if (loading) return <p>Loading Staff...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* ================= Billing List ================= */}
      <h2>Billing Service Lists</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Service Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {billingService.map(service => (
            <tr key={service.service_id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{service.service_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{service.service_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ================= Create Staff Form ================= */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Create Service</h2>
        <form>
          <p>Sevice Name</p>
          <input
            type="text"
            placeholder="Enter Service Name"
            value={addService.service_name}
            onChange={e => setAddService({ ...addService, service_name: e.target.value })}
          />
          <p>Description</p>
          <textarea
            maxLength={255}
            placeholder="Enter Description"
            rows={5}
            value={addService.description}
            onChange={e => setAddService({ ...addService, description: e.target.value })}
          />
          <p>Default Price</p>
          <input
            type="number"
            name="default_price"
            value={addService.default_price}
            onChange={e => setAddService({ ...addService, default_price: e.target.value })}
          />
          <p>Category</p>
          <input
            type="text"
            placeholde="Enter Category"
            value={addService.category}
            onChange={e => setAddService({ ...addService, category: e.target.value })}
          />
          <button onClick={handleAddService}>Submit</button>
          {successMessage && <p>{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default BillingService;
