import { useState, useEffect } from 'react';

import { getAllBillingService } from '../../api/billing_service';
import { createBillingItem } from '../../api/billingItem';

export default function AddBillingItemModal({
  isOpen,
  onClose,
  billingId, // ⬅ NEEDED
  onAddItem, // callback to parent
}) {
  // <-- change serviceId initial to empty string
  const [serviceId, setServiceId] = useState('');
  const [billingServices, setBillingServices] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const [defaultPrice, setDefaultPrice] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  // LOG incoming props for debugging
  console.log('AddBillingItemModal props =>', { isOpen, billingId, hasOnAddItem: !!onAddItem });

  useEffect(() => {
    if (!isOpen) return;

    async function fetchServices() {
      try {
        const result = await getAllBillingService();
        setBillingServices(result.billingService);
        // LOG service count for debugging
        console.log('Fetched billingServices count:', result.billingService?.length);
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    }

    fetchServices();
  }, [isOpen]);

  const handleAdd = async () => {
    if (!serviceId) {
      setError('Please select a service.');
      return;
    }

    try {
      const selectedService = billingServices.find(s => s.service_id === serviceId);

      const payload = {
        billing_id: billingId,
        service_id: serviceId,
        description: selectedService?.service_name,
        unit_price: unitPrice,
        quantity,
      };

      console.log('Creating billing item with payload:', payload);

      const response = await createBillingItem(payload);

      const createdItem = response.item;
      console.log('Create Billing Item Response:', response);

      onAddItem(createdItem);
      onClose();
    } catch (err) {
      setError('Failed to add billing item.');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* SERVICE SELECT */}
        <select
          value={serviceId}
          onChange={e => {
            const id = e.target.value;
            setServiceId(id);

            if (id === '') {
              setDefaultPrice(0);
              setUnitPrice(0);
              return;
            }

            const selected = billingServices.find(s => String(s.service_id) === id);

            if (selected) {
              setDefaultPrice(Number(selected.default_price));
              setUnitPrice(Number(selected.default_price));
            }
          }}
        >
          <option value="">Select service</option>
          {billingServices.map(service => (
            <option key={service.service_id} value={String(service.service_id)}>
              {service.service_name} - ₱{service.default_price}
            </option>
          ))}
        </select>

        {/* DEFAULT PRICE (read-only) */}
        <p>Default Price:</p>
        <input
          type="number"
          value={defaultPrice}
          readOnly
          style={{ background: '#eee', color: '#000' }}
        />

        {/* UNIT PRICE (editable) */}
        <p>Unit Price:</p>
        <input
          type="number"
          min="1"
          value={unitPrice}
          onChange={e => setUnitPrice(Number(e.target.value))}
        />

        {/* QUANTITY */}
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
        />

        <button type="button" onClick={handleAdd}>
          Add Item
        </button>
        <button onClick={onClose}>Cancel</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}
