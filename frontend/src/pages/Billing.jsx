import { useState, useEffect } from 'react';
import { getPaymentStatusStyle } from '../utils/badgeStyles';
import { useNavigate } from 'react-router-dom';
import AddBillingItemModal from '../components/modals/AddBillingItemModal';
import { useParams } from 'react-router-dom';

import {
  createBill,
  getAllBilling,
  getBillingById,
  toggleDeleteBilling,
  finalizeBilling,
  getAvailablePatients,
} from '../api/billing';

function Billing() {
  /* ============================================================
     🔹 URL PARAMS (example: /billing/:billing_id)
  ============================================================ */
  const { billing_id } = useParams();

  /* ============================================================
     🔹 MAIN BILLING LIST STATE
     - billing: stores all billing records
     - loading: controls loading display
     - successMessage / error: feedback for create operations
  ============================================================ */
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  /* ============================================================
     🔹 DROPDOWN — SELECT BILLING ID (not fully used here)
  ============================================================ */
  const [selectBillingId, setSelectBillingId] = useState('');
  const [availableBill, setAvailableBills] = useState([]);

  /* ============================================================
     🔹 AVAILABLE PATIENTS (for creating a new billing)
  ============================================================ */
  const [selectedPatientID, setSelectedPatientID] = useState('');
  const [availablePatients, setavailablePatients] = useState([]);

  /* ============================================================
     🔹 NAVIGATION (redirect to billing items page)
  ============================================================ */
  const navigate = useNavigate();

  /* ============================================================
     🔹 ADD ITEM MODAL OPEN/CLOSE CONTROL
  ============================================================ */
  const [isAddBillingItemOpen, setIsAddBillingItemOpen] = useState(false);

  function openAddBillingItemModal() {
    setAddBillingItemOpen(true);
  }

  function closeAddBillingItemModal() {
    setAddBillingItemOpen(false);
  }

  /* ============================================================
     🔹 FORM STATE FOR CREATING A BILLING
     - patient_id
     - total_amount (starts at 0)
     - payment_status ("pending")
  ============================================================ */
  const [addBilling, setAddBilling] = useState({
    patient_id: '',
    total_amount: '0',
    payment_status: 'pending',
  });

  /* ============================================================
     🔹 FETCH ALL BILLINGS ON FIRST LOAD
  ============================================================ */
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

        // Detailed error handling for clarity
        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
        } else if (error.request) {
          errorMessage = 'No response from server';
        } else {
          errorMessage = error.message;
        }

        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  /* ============================================================
     🔹 FETCH AVAILABLE PATIENTS FOR "CREATE BILLING"
  ============================================================ */
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
        } else if (error.request) {
          errorMessage = 'No response from server';
        } else {
          errorMessage = error.message;
        }

        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailablePatients();
  }, []);

  /* ============================================================
     🔹 RESET CREATE BILLING FORM
  ============================================================ */
  const resetForm = () => {
    setAddBilling({
      patient_id: '',
      total_amount: '0',
      payment_status: 'pending',
    });
  };

  /* ============================================================
     🔹 SUBMIT HANDLER — CREATE BILLING
  ============================================================ */
  const handAddBilling = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      // Construct payload by merging form + selected patient ID
      const payload = {
        ...addBilling,
        patient_id: selectedPatientID,
      };

      console.log('Final payload:', payload);

      const result = await createBill(payload);
      resetForm();

      setSuccessMessage('Billing created successfully!');
      console.log('Created Billing:', result);
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }

      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     🔹 USER CLICKED "ADD ITEM"
     Save billingId → open modal
  ============================================================ */
  const [selectedBillingId, setSelectedBillingId] = useState(null);

  const handleSelectedBilling = billingId => {
    setSelectedBillingId(billingId);
    setIsAddBillingItemOpen(true);
  };

  /* ============================================================
     🔹 LOCAL STATE TO STORE ADDED ITEMS
     (for UI updating only)
  ============================================================ */
  const [billingItems, setBillingItems] = useState([]);

  const handleAddItem = newItem => {
    setBillingItems(prev => [...prev, newItem]);
  };

  /* ============================================================
     🔹 Open function
  ============================================================ */

  function openAddItemModal(billing_id) {
    setSelectedBillingId(billing_id);
    setIsAddBillingItemOpen(true);
  }

  /* ============================================================
     🔹 EARLY RETURN FOR LOADING / ERROR
  ============================================================ */
  if (loading) return <p>Loading Staff...</p>;
  if (error) return <p>Error: {error.message}</p>;

  /* ============================================================
     🔹 JSX STARTS HERE
     Display billing list, create billing form, and modal
  ============================================================ */
  return (
    <div>
      {/* ========================================================
          BILLING TABLE (LIST OF ALL BILLINGS)
      ======================================================== */}
      <h2>Billing Lists</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Billing ID</th>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {billing.map(bill => (
            <tr key={bill.billing_id}>
              <td>{bill.billing_id}</td>
              <td>{bill.Patient?.patient_id}</td>
              <td>{bill.Patient?.first_name}</td>
              <td>{bill.total_amount}</td>
              <td>{bill.payment_status}</td>

              <td>
                {/* Navigate to Items Page */}
                <button onClick={() => navigate(`/dashboard/billing/${bill.billing_id}/items`)}>
                  View Items
                </button>

                {/* Opens "Add Item" modal */}
                <button onClick={() => handleSelectedBilling(bill.billing_id)}>Add Item</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ========================================================
          CREATE BILLING FORM
      ======================================================== */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Create Billing</h2>

        <form>
          {/* Patient Dropdown */}
          <p>Patient ID</p>
          <select value={selectedPatientID} onChange={e => setSelectedPatientID(e.target.value)}>
            <option value="">--Select a Patient--</option>
            {availablePatients.map(patient => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.patient_id} ({patient.first_name})
              </option>
            ))}
          </select>

          {/* Amount Display */}
          <p>Total Amount</p>
          <span style={{ padding: '6px 12px', backgroundColor: '#1f2937' }}>
            ₱{addBilling.total_amount}
          </span>

          {/* Payment Status Display */}
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

        {/* ========================================================
            ADD BILLING ITEM MODAL (only when open)
        ======================================================== */}
        {isAddBillingItemOpen && (
          <AddBillingItemModal
            isOpen={isAddBillingItemOpen}
            billingId={selectedBillingId}
            onAddItem={handleAddItem}
            onClose={closeAddBillingItemModal}
          />
        )}
      </div>
    </div>
  );
}

export default Billing;
