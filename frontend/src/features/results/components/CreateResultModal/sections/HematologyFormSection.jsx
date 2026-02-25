import { useState, useEffect } from 'react';
import { createHematology, updateHematology } from '../../../../../api/testTypes';

function HematologyFormSection({ resultId, onClose }) {
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hematologyId, setHematologyId] = useState('');

  const [formData, setFormData] = useState({
    hematology_id: '',
    result_id: '',

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

  const handleCreateHematology = async () => {
    if (creating) return;
    if (!resultId) {
      setError('Missing result ID.');
      return;
    }

    setError(null);
    setCreating(true);
    try {
      const result = await createHematology({ result_id: resultId, data: {} });

      if (result.success) {
        const created = result.data;

        setHematologyId(created.hematology_id);

        setFormData({
          hematology_id: created?.hematology_id || '',
          result_id: created?.result_id || '',

          hemoglobin: created?.hemoglobin || '',
          hematocrit: created?.hematocrit || '',
          rbc_count: created?.rbc_count || '',
          wbc_count: created?.wbc_count || '',
          platelet_count: created?.platelet_count || '',
          mcv: created?.mcv || '',
          mch: created?.mch || '',
          mchc: created?.mchc || '',
          neutrophils: created?.neutrophils || '',
          lymphocytes: created?.lymphocytes || '',
          monocytes: created?.monocytes || '',
          eosinophils: created?.eosinophils || '',
          basophils: created?.basophils || '',
          others: created?.others || '',
        });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create test result.';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveHematology = async () => {
    if (!hematologyId) {
      setError('Create hematology record first.');
      return;
    }

    if (saving) return;

    let hasError = false;
    const normalize = (val, field) => {
      if (val === '' || val === undefined || val === null) {
        return null;
      } else {
        const num = Number(val);
        if (isNaN(num)) {
          setError(`${field} must be a valid number`);
          hasError = true;
          return null;
        }
        return num;
      }
    };

    setSaving(true);
    setError(null);

    const payload = {
      hemoglobin: normalize(formData.hemoglobin, 'hemoglobin'),
      hematocrit: normalize(formData.hematocrit, 'hematocrit'),
      rbc_count: normalize(formData.rbc_count, 'rbc_count'),
      wbc_count: normalize(formData.wbc_count, 'wbc_count'),
      platelet_count: normalize(formData.platelet_count, 'platelet_count'),
      mcv: normalize(formData.mcv, 'mcv'),
      mch: normalize(formData.mch, 'mch'),
      mchc: normalize(formData.mchc, 'mchc'),
      neutrophils: normalize(formData.neutrophils, 'neutrophils'),
      lymphocytes: normalize(formData.lymphocytes, 'lymphocytes'),
      monocytes: normalize(formData.monocytes, 'monocytes'),
      eosinophils: normalize(formData.eosinophils, 'eosinophils'),
      basophils: normalize(formData.basophils, 'basophils'),
      others: formData.others.trim() === '' ? null : formData.others,
    };

    if (hasError) {
      setSaving(false);
      return;
    }

    try {
      const result = await updateHematology(hematologyId, payload);

      if (result.success) {
        setError(null);
        setFormData(result.data);
        onClose?.();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to save hematology result'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="result-form-section">
      <h3 className="resultf-form-section__title">Hematology Report</h3>
      <div className="data-card hematology-form">
        <h3>Create Hematology Result</h3>

        {!hematologyId && (
          <p className="hint-text">Click Create to initialize a hematology record.</p>
        )}

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleCreateHematology} disabled={creating || !!hematologyId}>
          {creating ? 'Creating…' : 'Create'}
        </button>

        {/* Lock the rest of the form until hematologyId exists */}
        <fieldset disabled={!hematologyId}>
          <div className="edit-form-grid">
            <div className="form-field">
              <label>Hemoglobin</label>
              <input
                type="text"
                value={formData.hemoglobin}
                onChange={e => setFormData(prev => ({ ...prev, hemoglobin: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Hematocrit</label>
              <input
                type="text"
                value={formData.hematocrit}
                onChange={e => setFormData(prev => ({ ...prev, hematocrit: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>RBC Count</label>
              <input
                type="text"
                value={formData.rbc_count}
                onChange={e => setFormData(prev => ({ ...prev, rbc_count: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>WBC Count</label>
              <input
                type="text"
                value={formData.wbc_count}
                onChange={e => setFormData(prev => ({ ...prev, wbc_count: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Platelet Count</label>
              <input
                type="text"
                value={formData.platelet_count}
                onChange={e => setFormData(prev => ({ ...prev, platelet_count: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>MCV</label>
              <input
                type="text"
                value={formData.mcv}
                onChange={e => setFormData(prev => ({ ...prev, mcv: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>MCH</label>
              <input
                type="text"
                value={formData.mch}
                onChange={e => setFormData(prev => ({ ...prev, mch: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>MCHC</label>
              <input
                type="text"
                value={formData.mchc}
                onChange={e => setFormData(prev => ({ ...prev, mchc: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Neutrophils</label>
              <input
                type="text"
                value={formData.neutrophils}
                onChange={e => setFormData(prev => ({ ...prev, neutrophils: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Lymphocytes</label>
              <input
                type="text"
                value={formData.lymphocytes}
                onChange={e => setFormData(prev => ({ ...prev, lymphocytes: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Monocytes</label>
              <input
                type="text"
                value={formData.monocytes}
                onChange={e => setFormData(prev => ({ ...prev, monocytes: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Eosinophils</label>
              <input
                type="text"
                value={formData.eosinophils}
                onChange={e => setFormData(prev => ({ ...prev, eosinophils: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Basophils</label>
              <input
                type="text"
                value={formData.basophils}
                onChange={e => setFormData(prev => ({ ...prev, basophils: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Others</label>
              <textarea
                value={formData.others}
                onChange={e => setFormData(prev => ({ ...prev, others: e.target.value }))}
              />
            </div>

            <button onClick={handleSaveHematology} disabled={!hematologyId || saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default HematologyFormSection;
