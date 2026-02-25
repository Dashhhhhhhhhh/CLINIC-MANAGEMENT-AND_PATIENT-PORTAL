import { useState } from 'react';
import { createUltrasound, updateUltrasound } from '../../../../../api/testTypes';

function UltrasoundFormSection({ resultId, onClose }) {
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ultrasoundId, setUltrasoundId] = useState('');

  const [formData, setFormData] = useState({
    ultrasound_type: '',
    history: '',
    comparison: '',
    technique: '',
    findings: '',
    impression: '',
    remarks: '',
  });

  const handleCreateUltrasound = async () => {
    const type = formData.ultrasound_type.trim();

    if (!type) {
      setError('Ultrasound type is required');
      return;
    }

    if (!resultId) {
      setError('Missing result ID.');
      return;
    }

    setError('');
    setCreating(true);

    try {
      const result = await createUltrasound({
        result_id: resultId,
        data: { ultrasound_type: type },
      });
      if (result.success) {
        const created = result.data.ultrasound;
        setUltrasoundId(created.ultrasound_id);

        setFormData({
          ultrasound_type: created.ultrasound_type || '',
          history: created.history || '',
          comparison: created.comparison || '',
          technique: created.technique || '',
          findings: created.findings || '',
          impression: created.impression || '',
          remarks: created.remarks || '',
        });
        console.log('ULTRASOUND ID SET TO:', created.ultrasound_id);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to create test result.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSaveUltrasound = async () => {
    setSaving(true);
    setError('');

    const payload = { ...formData };

    try {
      const result = await updateUltrasound(ultrasoundId, payload);
      if (result.success) {
        setError(null);
        setFormData(result.data.ultrasound);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to save ultrasound result'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="result-form-section">
      <h3 className="resultf-form-section__title">Ultrasound Report</h3>

      {!ultrasoundId && (
        <p className="hint-text">Enter Ultrasound Type (e.g., abdominal) then click Create.</p>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label className="form-label">Ultrasound Type</label>
        <input
          type="text"
          name="ultrasound_type"
          className="form-input"
          value={formData.ultrasound_type}
          disabled={!!ultrasoundId}
          onChange={e => setFormData(prev => ({ ...prev, ultrasound_type: e.target.value }))}
        />
      </div>

      <button onClick={handleCreateUltrasound} disabled={!!ultrasoundId}>
        {creating ? 'Creating…' : 'Create'}
      </button>

      <fieldset disabled={!ultrasoundId}>
        <div className="form-group">
          <label className="form-label">History</label>
          <textarea
            name="history"
            className="form-textarea large-textarea"
            rows={10}
            value={formData.history}
            onChange={e => setFormData(prev => ({ ...prev, history: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Comparison</label>
          <textarea
            name="comparison"
            className="form-textarea large-textarea"
            rows={10}
            value={formData.comparison}
            onChange={e => setFormData(prev => ({ ...prev, comparison: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Technique</label>
          <textarea
            name="technique"
            className="form-textarea large-textarea"
            rows={10}
            value={formData.technique}
            onChange={e => setFormData(prev => ({ ...prev, technique: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Findings</label>
          <textarea
            name="findings"
            className="form-textarea large-textarea"
            rows={10}
            value={formData.findings}
            onChange={e => setFormData(prev => ({ ...prev, findings: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Impression</label>
          <textarea
            name="impression"
            className="form-textarea large-textarea"
            rows={10}
            value={formData.impression}
            onChange={e => setFormData(prev => ({ ...prev, impression: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Remarks</label>
          <textarea
            name="remarks"
            className="form-textarea large-textarea"
            rows={10}
            value={formData.remarks}
            onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
          />
        </div>

        <button onClick={handleSaveUltrasound} disabled={!ultrasoundId || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </fieldset>
    </div>
  );
}

export default UltrasoundFormSection;
