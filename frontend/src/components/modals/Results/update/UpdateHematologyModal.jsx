import { useState, useEffect } from 'react';

export default function UpdateHematologyModal({ isOpen, selectedResult, onClose, onUpdated }) {
  const [formState, setFormState] = useState({
    hemoglobin: '',
    hematocrit: '',
    rbc_count: '',
    wbc_count: '',
    platelet_count: '',
    mcv: '',
    mch: '',
    mchc: '',
    neutrophils: '',
    lymphocytes: '',
    monocytes: '',
    eosinophils: '',
    basophils: '',
    others: '',
  });

  const [status, setStatus] = useState('idle');

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isOpen || !selectedResult) return;

    setFormState({
      hemoglobin: selectedResult.result_data?.hemoglobin ?? '',
      hematocrit: selectedResult.result_data?.hematocrit ?? '',
      rbc_count: selectedResult.result_data?.rbc ?? '',
      wbc_count: selectedResult.result_data?.wbc ?? '',
      platelet_count: selectedResult.result_data?.platelets ?? '',
      mcv: selectedResult.result_data?.mcv ?? '',
      mch: selectedResult.result_data?.mch ?? '',
      mchc: selectedResult.result_data?.mchc ?? '',
      neutrophils: selectedResult.result_data?.neutrophils ?? '',
      lymphocytes: selectedResult.result_data?.lymphocytes ?? '',
      monocytes: selectedResult.result_data?.monocytes ?? '',
      eosinophils: selectedResult.result_data?.eosinophils ?? '',
      basophils: selectedResult.result_data?.basophils ?? '',
      others: selectedResult.result_data?.others ?? '',
    });
  }, [isOpen, selectedResult]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage(null);

    const hematologyId = selectedResult.result_id;

    console.log(selectedResult);

    const cleanNumber = value => (value === 0 || value === '' ? undefined : value);
    const payload = {
      hemoglobin: cleanNumber(formState.hemoglobin),
      hematocrit: cleanNumber(formState.hematocrit),
      rbc_count: cleanNumber(formState.rbc_count),
      wbc_count: cleanNumber(formState.wbc_count),
      platelet_count: cleanNumber(formState.platelet_count),
      mcv: cleanNumber(formState.mcv),
      mch: cleanNumber(formState.mch),
      mchc: cleanNumber(formState.mchc),
      neutrophils: cleanNumber(formState.neutrophils),
      lymphocytes: cleanNumber(formState.lymphocytes),
      monocytes: cleanNumber(formState.monocytes),
      eosinophils: cleanNumber(formState.eosinophils),
      basophils: cleanNumber(formState.basophils),
    };
    console.log('PATCH payload:', payload);

    try {
      console.log('PATCH payload:', payload);

      const response = await fetch(`http://localhost:3000/hematology/${hematologyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update hematology result`);
      }

      setStatus('success');

      if (onUpdated) {
        onUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 400);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to update hematology result.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <p>Hemoglobin</p>
          <input
            type="number"
            value={formState.hemoglobin}
            onChange={e =>
              setFormState({
                ...formState,
                hemoglobin: e.target.value,
              })
            }
          />

          <p>Hematocrit</p>
          <input
            type="number"
            value={formState.hematocrit}
            onChange={e =>
              setFormState({
                ...formState,
                hematocrit: e.target.value,
              })
            }
          />

          <p>RBC</p>
          <input
            type="number"
            value={formState.rbc_count}
            onChange={e =>
              setFormState({
                ...formState,
                rbc_count: e.target.value,
              })
            }
          />

          <p>WBC</p>
          <input
            type="number"
            value={formState.wbc_count}
            onChange={e =>
              setFormState({
                ...formState,
                wbc_count: e.target.value,
              })
            }
          />

          <p>Platelet Count</p>
          <input
            type="number"
            value={formState.platelet_count}
            onChange={e =>
              setFormState({
                ...formState,
                platelet_count: e.target.value,
              })
            }
          />

          <p>MCV</p>
          <input
            type="number"
            value={formState.mcv}
            onChange={e =>
              setFormState({
                ...formState,
                mcv: e.target.value,
              })
            }
          />

          <p>MCH</p>
          <input
            type="number"
            value={formState.mch}
            onChange={e =>
              setFormState({
                ...formState,
                mch: e.target.value,
              })
            }
          />

          <p>MCHC</p>
          <input
            type="number"
            value={formState.mchc}
            onChange={e =>
              setFormState({
                ...formState,
                mchc: e.target.value,
              })
            }
          />

          <p>Neutrophils</p>
          <input
            type="number"
            value={formState.neutrophils}
            onChange={e =>
              setFormState({
                ...formState,
                neutrophils: e.target.value,
              })
            }
          />

          <p>Lymphocytes</p>
          <input
            type="number"
            value={formState.lymphocytes}
            onChange={e =>
              setFormState({
                ...formState,
                lymphocytes: e.target.value,
              })
            }
          />

          <p>Monocytes</p>
          <input
            type="number"
            value={formState.monocytes}
            onChange={e =>
              setFormState({
                ...formState,
                monocytes: e.target.value,
              })
            }
          />

          <p>Eosinophils</p>
          <input
            type="number"
            value={formState.eosinophils}
            onChange={e =>
              setFormState({
                ...formState,
                eosinophils: e.target.value,
              })
            }
          />

          <p>Basophils</p>
          <input
            type="number"
            value={formState.basophils}
            onChange={e =>
              setFormState({
                ...formState,
                basophils: e.target.value,
              })
            }
          />

          <p>Others</p>
          <textarea
            name="others"
            value={formState.others}
            onChange={e =>
              setFormState({
                ...formState,
                others: e.target.value,
              })
            }
          />

          {status === 'error' && <p className="error-message">{errorMessage}</p>}

          <button type="submit" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? 'Saving...' : status === 'success' ? 'Saved' : 'Update'}
          </button>

          <button type="button" disabled={status === 'loading'} onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
