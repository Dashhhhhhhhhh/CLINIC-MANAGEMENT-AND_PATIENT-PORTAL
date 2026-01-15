import { useState, useEffect } from 'react';
import { updateHematologyResult } from '../../../../api/results';

export default function UpdateResultModal({
  isOpen,
  onClose,
  onSuccess,
  testRecord,
  recordId,
  testType,
}) {
  const [formState, setFormState] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ PREFILL (backend → frontend mapping)
  useEffect(() => {
    if (!isOpen || !testRecord) return;

    setFormState({
      hemoglobin: testRecord.hemoglobin ?? '',
      hematocrit: testRecord.hematocrit ?? '',

      rbc_count: testRecord.rbc_count ?? '',
      wbc_count: testRecord.wbc_count ?? '',
      platelet_count: testRecord.platelet_count ?? '',

      mcv: testRecord.mcv ?? '',
      mch: testRecord.mch ?? '',
      mchc: testRecord.mchc ?? '',

      neutrophils: testRecord.neutrophils ?? '',
      lymphocytes: testRecord.lymphocytes ?? '',
      monocytes: testRecord.monocytes ?? '',
      eosinophils: testRecord.eosinophils ?? '',
      basophils: testRecord.basophils ?? '',
      others: testRecord.others ?? '',
    });
  }, [isOpen, testRecord]);

  // ✅ Remove empty fields + cast numbers
  const buildCleanResultData = data => {
    const cleaned = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleaned[key] = isNaN(value) ? value : Number(value);
      }
    });

    return cleaned;
  };

  // ✅ SUBMIT → HEMATOLOGY PATCH
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      if (!recordId) {
        setErrorMessage('Missing hematology ID');
        return;
      }

      const cleanResultData = buildCleanResultData(formState);

      const response = await updateHematologyResult(recordId, cleanResultData);

      if (!response?.success) {
        setErrorMessage(response?.message || 'Update failed');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong while updating');
    }
  };

  // ✅ Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFormState({});
      setErrorMessage('');
    }
  }, [isOpen]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Update {testType} Result</h2>
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          {[
            ['Hemoglobin', 'hemoglobin'],
            ['Hematocrit', 'hematocrit'],
            ['RBC Count', 'rbc_count'],
            ['WBC Count', 'wbc_count'],
            ['Platelet Count', 'platelet_count'],
            ['MCV', 'mcv'],
            ['MCH', 'mch'],
            ['MCHC', 'mchc'],
            ['Neutrophils', 'neutrophils'],
            ['Lymphocytes', 'lymphocytes'],
            ['Monocytes', 'monocytes'],
            ['Eosinophils', 'eosinophils'],
            ['Basophils', 'basophils'],
          ].map(([label, key]) => (
            <div key={key}>
              <p>{label}</p>
              <input
                type="number"
                value={formState[key] ?? ''}
                onChange={e => setFormState({ ...formState, [key]: e.target.value })}
              />
            </div>
          ))}

          <p>Other Findings</p>
          <textarea
            value={formState.others ?? ''}
            onChange={e => setFormState({ ...formState, others: e.target.value })}
          />

          <div className="button-group">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
