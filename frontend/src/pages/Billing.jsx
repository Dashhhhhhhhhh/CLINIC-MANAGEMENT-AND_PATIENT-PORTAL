import { useState, useEffect } from 'react';
import { getPaymentStatusStyle } from '../utils/badgeStyles';
import {
  createBill,
  getAllBilling,
  getBillingById,
  toggleDeleteBilling,
  finalizeBilling,
  getAvailablePatients,
} from '../api/billing';

function Billing() {
  //State Variables

  // fetchAll Variabes

  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Dropdown billing variables

  const [selectBillingId, setSelectBillingId] = useState('');
  const [availableBill, setAvailableBills] = useState([]);

  // Dropdown available patients

  const [selectedPatientID, setSelectedPatientID] = useState('');
  const [availablePatients, setavailablePatients] = useState([]);

  // handleAdd variables

  const [addBilling, setAddBilling] = useState({
    patient_id: '',
    total_amount: '0',
    payment_status: 'pending',
  });
  // Fetch Doctors (Initial Load)

  useEffect(() => {
    const fetchBilling = async () => {
      setLoading(true);
      setSuccessMessage('');
      setError(null);
      try {
        const result = await getAllBilling();
        setBilling(result.billing);
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
    fetchBilling();
  }, []);

  // Fetch available patients

  useEffect(() => {
    const fetchAvailablePatients = async () => {
      try {
        const response = await fetch('http://localhost:3000/billing/available-patients');
        const data = await response.json();

        if (data.success) {
          setavailablePatients(data.patients);
        }
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
    fetchAvailablePatients();
  }, []);

  // Create Billing handler

  const resetForm = () => {
    setAddBilling({
      patient_id: '',
      total_amount: '0',
      payment_status: 'pending',
    });
  };

  const handAddBilling = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const payload = {
        ...addBilling,
        patient_id: selectedPatientID,
      };

      console.log('Final payload being sent:', payload);

      const result = await createBill(payload);
      console.log(' Finished API call, proceeding...');
      resetForm();

      setSuccessMessage('Billing created successfully!');
      console.log('Created Billing:', result);
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

  if (loading) return <p>Loading Staff...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* ================= Billing List ================= */}
      <h2>Billing Lists</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Billing ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Patient ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Patient Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total Amount</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {billing.map(bill => (
            <tr key={bill.billing_id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{bill.billing_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {bill.Patient?.patient_id}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {bill.Patient?.first_name}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{bill.total_amount}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{bill.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ================= Create Staff Form ================= */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Create Billing</h2>
        <form>
          <p>Patient ID</p>
          <select value={selectedPatientID} onChange={e => setSelectedPatientID(e.target.value)}>
            <option value="">--Select a Patient--</option>
            {availablePatients.map(patient => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.patient_id} ({patient.first_name})
              </option>
            ))}
          </select>
          <p>Total Amount</p>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#1f2937',
              display: 'inline-block',
              minWidth: '80px',
            }}
          >
            ₱{addBilling.total_amount}
          </span>
          <p>Payment Status</p>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 'bold',
              ...getPaymentStatusStyle(addBilling.payment_status),
            }}
          >
            {addBilling.payment_status}
          </span>
          <button onClick={handAddBilling}>Submit</button>
          {successMessage && <p>{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Billing;
