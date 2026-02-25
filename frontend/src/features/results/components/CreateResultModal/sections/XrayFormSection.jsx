import { useState } from 'react';
import { createXray, updateXray } from '../../../../../api/testTypes';

function XrayFormSection({ resultId, onClose }) {
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [xrayId, setXrayId] = useState('');

  const [formData, setFormData] = useState({
    xray_type: '',
    history: '',
    comparison: '',
    technique: '',
    findings: '',
    impression: '',
    remarks: '',
  });

  const handleCreateXray = async () => {
    const type = formData.xray_type.trim();
    if (!type) {
      setError('X-ray Type is required.');
      return;
    }
    if (!resultId) {
      setError('Missing result ID.');
      return;
    }

    setError('');
    setCreating(true);

    try {
      const result = await createXray({ result_id: resultId, data: { xray_type: type } });
      if (result.success) {
        const created = result.data.xray_id;
        setXrayId(created.xray_id);
        setFormData({
          ultrasound_type: created.ultrasound_type || '',
          history: created.history || '',
          comparison: created.comparison || '',
          technique: created.technique || '',
          findings: created.findings || '',
          impression: created.impression || '',
          remarks: created.remarks || '',
        });
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

  const handleSaveXray = async () => {
    setSaving(true);
    setError('');

    const payload = { ...formData };

    try {
      const result = await updateXray(xrayId, payload);
      if (result.success) {
        setError(null);
        setFormData(result.data.xray);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to save xray result'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="result-form-section">
      <h3 className="resultf-form-section__title">X-Ray Report</h3>

      {!xrayId && <p className="hint-text">Enter X-ray Type (e.g., Chest) then click Create.</p>}

      {error && <div className="error-message">{error}</div>}

      {/* X-ray Type stays editable */}
      <div className="form-group">
        <label className="form-label">X-ray Type</label>
        <input
          type="text"
          name="xray_type"
          className="form-input"
          value={formData.xray_type}
          onChange={e => setFormData(prev => ({ ...prev, xray_type: e.target.value }))}
        />
      </div>

      <button onClick={handleCreateXray} disabled={!!xrayId}>
        {creating ? 'Creating…' : 'Create'}
      </button>

      {/* Lock the rest of the form until xrayId exists */}
      <fieldset disabled={!xrayId}>
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

        <button onClick={handleSaveXray} disabled={!xrayId || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </fieldset>
    </div>
  );
}

export default XrayFormSection;
