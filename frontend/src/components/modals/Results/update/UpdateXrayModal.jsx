export default function UpdateXrayModal({
  isOpen, // controls whether modal is visible
  selectedResult, // result data chosen from the table
  onClose, // function to close modal
  onUpdated, // callback to refresh parent list after update
}) {
  /* ============================================================
     1️⃣ FORM STATE
     ------------------------------------------------------------
     - Holds all editable X-ray fields
     - Controlled inputs read/write from here
     - Initialized empty, then prefilled when modal opens
  ============================================================ */
  const [formState, setFormState] = useState({
    result_id: '',
    history: '',
    comparison: '',
    technique: '',
    findings: '',
    impression: '',
    remarks: '',
  });

  /* ============================================================
     2️⃣ UI STATUS STATE
     ------------------------------------------------------------
     - idle    → default
     - loading → PATCH request in progress
     - success → update completed
     - error   → something failed
     Used mainly for UX feedback and button disabling
  ============================================================ */
  const [status, setStatus] = useState('idle');

  /* ============================================================
     3️⃣ ERROR MESSAGE STATE
     ------------------------------------------------------------
     - Only used when PATCH fails
     - Displayed conditionally in the UI
  ============================================================ */
  const [errorMessage, setErrorMessage] = useState(null);

  /* ============================================================
     4️⃣ PREFILL FORM WHEN MODAL OPENS
     ------------------------------------------------------------
     This runs:
     - when modal opens
     - OR when a different result is selected
     
     WHY this exists:
     - Props (selectedResult) should NOT be edited directly
     - We copy props → local state for editing
  ============================================================ */
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

  /* ============================================================
     5️⃣ SUBMIT HANDLER (PATCH UPDATE)
     ------------------------------------------------------------
     Flow:
     - prevent default submit
     - block duplicate requests
     - send PATCH to backend
     - handle success / error
  ============================================================ */
  const handleSubmit = async e => {
    e.preventDefault();

    // prevent double-submit
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage(null);

    // ID needed by backend route
    const xrayId = selectedResult.xray_id;

    try {
      const response = await fetch(`/xray/${xrayId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error('Failed to update X-ray result');
      }

      /* ======================
         ✅ SUCCESS FLOW
      ====================== */
      setStatus('success');

      // tell parent to refresh list
      if (onUpdated) {
        onUpdated();
      }

      // small delay for UX before closing modal
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (error) {
      /* ======================
         ❌ ERROR FLOW
      ====================== */
      setStatus('error');
      setErrorMessage(error.message || 'Failed to update X-ray result.');
    }
  };

  /* ============================================================
     6️⃣ RESET STATUS WHEN MODAL OPENS
     ------------------------------------------------------------
     - Clears old errors / success state
     - Important when reopening modal multiple times
  ============================================================ */
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  /* ============================================================
     7️⃣ RENDER UI
     ------------------------------------------------------------
     - Controlled textareas
     - Each input updates formState
     - Button reacts to status
  ============================================================ */
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          {/* Each textarea:
              - value comes from formState
              - onChange updates only that field
          */}
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
