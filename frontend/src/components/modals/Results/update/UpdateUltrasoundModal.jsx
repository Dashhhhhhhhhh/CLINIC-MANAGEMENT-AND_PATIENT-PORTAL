export default function UpdateUltrasoundModal({ isOpen, selectedResult, onClose, onUpdated }) {
  const [formState, setFormState] = useState({
    result_id: '',
    history: '',
    comparison: '',
    technique: '',
    findings: '',
    impression: '',
    remarks: '',
  });

  const [status, setStatus] = useState('idle');

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isOpen || !selectedResult) return;

    setFormState({
      result_id: selectedResult.result_id || '',
      history: selectedResult.history || '',
      comparison: selectedResult.comparison || '',
      technique: selectedResult.technique || '',
      findings: selectedResult.findings || '',
      impression: selectedResult.impression || '',
      remarks: selectedResult.remarks || '',
    });
  }, [isOpen, selectedResult]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage(null);

    const ultraSoundId = selectedResult.ultrasound_id;

    try {
      const response = await fetch(`/ultrasound/${ultraSoundId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error('Failed to update ultrasound result.');
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
      setErrorMessage(error.message || 'Failed to update ultrasound result');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <textarea
            name="history"
            value={formState.history}
            onChange={e =>
              setFormState({
                ...formState,
                history: e.target.value,
              })
            }
          />

          <textarea
            name="comparison"
            value={formState.comparison}
            onChange={e =>
              setFormState({
                ...formState,
                comparison: e.target.value,
              })
            }
          />

          <textarea
            name="technique"
            value={formState.technique}
            onChange={e =>
              setFormState({
                ...formState,
                technique: e.target.value,
              })
            }
          />

          <textarea
            name="findings"
            value={formState.findings}
            onChange={e =>
              setFormState({
                ...formState,
                findings: e.target.value,
              })
            }
          />

          <textarea
            name="impression"
            value={formState.impression}
            onChange={e =>
              setFormState({
                ...formState,
                impression: e.target.value,
              })
            }
          />

          <textarea
            name="remarks"
            value={formState.remarks}
            onChange={e =>
              setFormState({
                ...formState,
                remarks: e.target.value,
              })
            }
          />

          {/* Error feedback */}
          {status === 'error' && <p className="error-message">{errorMessage}</p>}

          {/* Button reflects request state */}
          <button type="submit" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? 'Saving...' : status === 'success' ? 'Saved' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
}
