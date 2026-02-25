import { useState, useEffect } from 'react';
import { createUrinalysis, updateUrinalysis } from '../../../api/testTypes';

function UrinalysisFormSection({ resultId, onClose }) {
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [urinalysisId, setUrinalysisId] = useState('');

  const [formData, setFormData] = useState({
    urinalysis_id: '',
    result_id: '',

    color: '',
    transparency: '',
    leukocytes: '',
    ketone: '',
    nitrite: '',
    urobilinogen: '',
    bilirubin: '',
    glucose: '',
    protein: '',
    specific_gravity: '',
    ph: '',
    blood: '',
    vitamin_c: '',
    microalbumin: '',
    calcium: '',
    ascorbic_acid: '',
    pus_cells: '',
    rbc: '',
    epithelial_cells: '',
    mucus_threads: '',
    bacteria: '',
    yeast_cells: '',
    hyaline_cast: '',
    wbc_cast: '',
    rbc_cast: '',
    coarse_granular_cast: '',
    fine_granular_cast: '',
    waxy_cast: '',
    other_cast: '',
    amorphous_urates: '',
    amorphous_phosphates: '',
    calcium_oxalate: '',
    calcium_carbonate: '',
    uric_acid_crystals: '',
    triple_phosphates: '',
    cystine: '',
    clue_cells: '',
    trichomonas_vaginalis: '',
    renal_cells: '',
    pregnancy_tests: '',
    others: '',
    notes: '',
  });

  const handleCreateUrinalysis = async () => {
    if (creating) return;
    if (!resultId) {
      setError('Missing result ID.');
      return;
    }

    setError(null);
    setCreating(true);
    try {
      const result = await createUrinalysis({ result_id: resultId, data: {} });

      if (result.success) {
        const created = result.data;
        console.log('created:', created);

        setUrinalysisId(created.urinalysis_id);

        setFormData({
          urinalysis_id: created?.urinalysis_id || '',
          result_id: created?.result_id || '',

          color: created?.color || '',
          transparency: created?.transparency || '',
          leukocytes: created?.leukocytes || '',
          ketone: created?.ketone || '',
          nitrite: created?.nitrite || '',
          urobilinogen: created?.urobilinogen || '',
          bilirubin: created?.bilirubin || '',
          glucose: created?.glucose || '',
          protein: created?.protein || '',
          specific_gravity: created?.specific_gravity || '',
          ph: created?.ph || '',
          blood: created?.blood || '',
          vitamin_c: created?.vitamin_c || '',
          microalbumin: created?.microalbumin || '',
          calcium: created?.calcium || '',
          ascorbic_acid: created?.ascorbic_acid || '',
          pus_cells: created?.pus_cells || '',
          rbc: created?.rbc || '',
          epithelial_cells: created?.epithelial_cells || '',
          mucus_threads: created?.mucus_threads || '',
          bacteria: created?.bacteria || '',
          yeast_cells: created?.yeast_cells || '',
          hyaline_cast: created?.hyaline_cast || '',
          wbc_cast: created?.wbc_cast || '',
          rbc_cast: created?.rbc_cast || '',
          coarse_granular_cast: created?.coarse_granular_cast || '',
          fine_granular_cast: created?.fine_granular_cast || '',
          waxy_cast: created?.waxy_cast || '',
          other_cast: created?.other_cast || '',
          amorphous_urates: created?.amorphous_urates || '',
          amorphous_phosphates: created?.amorphous_phosphates || '',
          calcium_oxalate: created?.calcium_oxalate || '',
          calcium_carbonate: created?.calcium_carbonate || '',
          uric_acid_crystals: created?.uric_acid_crystals || '',
          triple_phosphates: created?.triple_phosphates || '',
          cystine: created?.cystine || '',
          clue_cells: created?.clue_cells || '',
          trichomonas_vaginalis: created?.trichomonas_vaginalis || '',
          renal_cells: created?.renal_cells || '',
          pregnancy_tests: created?.pregnancy_tests || '',
          others: created?.others || '',
          notes: created?.notes || '',
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

  const handleSaveUrinalysis = async () => {
    if (!urinalysisId) {
      setError('Create urinalysis record first.');
      return;
    }

    if (saving) return;

    let hasError = false;
    const normalizeNumber = (val, field) => {
      if (val === '' || val === undefined || val === null) {
        return null;
      }

      const num = Number(val);
      if (isNaN(num)) {
        setError(`${field} must be a valid number`);
        return undefined;
      }

      return num;
    };

    const normalizeText = val => {
      if (val === null || val === undefined) return null;

      const cleaned = val.toString().trim().replace(/\s+/g, ' ').normalize('NFC');

      return cleaned === '' ? null : cleaned;
    };

    setSaving(true);
    setError(null);
    const specificGravity = normalizeNumber(formData.specific_gravity, 'specific_gravity');
    if (specificGravity === undefined) {
      setSaving(false);
      return;
    }

    const payload = {
      color: normalizeText(formData.color),
      transparency: normalizeText(formData.transparency),
      leukocytes: normalizeText(formData.leukocytes),
      ketone: normalizeText(formData.ketone),
      nitrite: normalizeText(formData.nitrite),
      urobilinogen: normalizeText(formData.urobilinogen),
      bilirubin: normalizeText(formData.bilirubin),
      glucose: normalizeText(formData.glucose),
      protein: normalizeText(formData.protein),
      specific_gravity: specificGravity,
      ph: normalizeText(formData.ph),
      blood: normalizeText(formData.blood),
      vitamin_c: normalizeText(formData.vitamin_c),
      microalbumin: normalizeText(formData.microalbumin),
      calcium: normalizeText(formData.calcium),
      ascorbic_acid: normalizeText(formData.ascorbic_acid),
      pus_cells: normalizeText(formData.pus_cells),
      rbc: normalizeText(formData.rbc),
      epithelial_cells: normalizeText(formData.epithelial_cells),
      mucus_threads: normalizeText(formData.mucus_threads),
      bacteria: normalizeText(formData.bacteria),
      yeast_cells: normalizeText(formData.yeast_cells),
      hyaline_cast: normalizeText(formData.hyaline_cast),
      wbc_cast: normalizeText(formData.wbc_cast),
      rbc_cast: normalizeText(formData.rbc_cast),
      coarse_granular_cast: normalizeText(formData.coarse_granular_cast),
      fine_granular_cast: normalizeText(formData.fine_granular_cast),
      waxy_cast: normalizeText(formData.waxy_cast),
      other_cast: normalizeText(formData.other_cast),
      amorphous_urates: normalizeText(formData.amorphous_urates),
      amorphous_phosphates: normalizeText(formData.amorphous_phosphates),
      calcium_oxalate: normalizeText(formData.calcium_oxalate),
      calcium_carbonate: normalizeText(formData.calcium_carbonate),
      uric_acid_crystals: normalizeText(formData.uric_acid_crystals),
      triple_phosphates: normalizeText(formData.triple_phosphates),
      cystine: normalizeText(formData.cystine),
      clue_cells: normalizeText(formData.clue_cells),
      trichomonas_vaginalis: normalizeText(formData.trichomonas_vaginalis),
      renal_cells: normalizeText(formData.renal_cells),
      pregnancy_tests: normalizeText(formData.pregnancy_tests),
      others: normalizeText(formData.others),
      notes: normalizeText(formData.notes),
    };
    onClose?.();

    if (hasError) {
      setSaving(false);
      return;
    }

    try {
      const result = await updateUrinalysis(urinalysisId, payload);

      if (result.success) {
        setError(null);
        const created = result.data;

        setFormData({
          urinalysis_id: created?.urinalysis_id ?? '',
          result_id: created?.result_id ?? '',

          color: created?.color ?? '',
          transparency: created?.transparency ?? '',
          leukocytes: created?.leukocytes ?? '',
          ketone: created?.ketone ?? '',
          nitrite: created?.nitrite ?? '',
          urobilinogen: created?.urobilinogen ?? '',
          bilirubin: created?.bilirubin ?? '',
          glucose: created?.glucose ?? '',
          protein: created?.protein ?? '',
          specific_gravity: created?.specific_gravity ?? '',
          ph: created?.ph ?? '',
          blood: created?.blood ?? '',
          vitamin_c: created?.vitamin_c ?? '',
          microalbumin: created?.microalbumin ?? '',
          calcium: created?.calcium ?? '',
          ascorbic_acid: created?.ascorbic_acid ?? '',
          pus_cells: created?.pus_cells ?? '',
          rbc: created?.rbc ?? '',
          epithelial_cells: created?.epithelial_cells ?? '',
          mucus_threads: created?.mucus_threads ?? '',
          bacteria: created?.bacteria ?? '',
          yeast_cells: created?.yeast_cells ?? '',
          hyaline_cast: created?.hyaline_cast ?? '',
          wbc_cast: created?.wbc_cast ?? '',
          rbc_cast: created?.rbc_cast ?? '',
          coarse_granular_cast: created?.coarse_granular_cast ?? '',
          fine_granular_cast: created?.fine_granular_cast ?? '',
          waxy_cast: created?.waxy_cast ?? '',
          other_cast: created?.other_cast ?? '',
          amorphous_urates: created?.amorphous_urates ?? '',
          amorphous_phosphates: created?.amorphous_phosphates ?? '',
          calcium_oxalate: created?.calcium_oxalate ?? '',
          calcium_carbonate: created?.calcium_carbonate ?? '',
          uric_acid_crystals: created?.uric_acid_crystals ?? '',
          triple_phosphates: created?.triple_phosphates ?? '',
          cystine: created?.cystine ?? '',
          clue_cells: created?.clue_cells ?? '',
          trichomonas_vaginalis: created?.trichomonas_vaginalis ?? '',
          renal_cells: created?.renal_cells ?? '',
          pregnancy_tests: created?.pregnancy_tests ?? '',
          others: created?.others ?? '',
          notes: created?.notes ?? '',
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to save urinalysis result'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="result-form-section">
      <h3 className="resultf-form-section__title">Urinalysis Report</h3>
      <div className="data-card hematology-form">
        <h3>Create Urinalysis Result</h3>

        {!urinalysisId && (
          <p className="hint-text">Click Create to initialize a hematology record.</p>
        )}

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleCreateUrinalysis} disabled={creating || !!urinalysisId}>
          {creating ? 'Creating…' : 'Create'}
        </button>
        <fieldset disabled={!urinalysisId}>
          <div className="edit-form-grid">
            <div className="form-field">
              <label>Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Transparency</label>
              <input
                type="text"
                value={formData.transparency}
                onChange={e => setFormData(prev => ({ ...prev, transparency: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Leukocytes</label>
              <input
                type="text"
                value={formData.leukocytes}
                onChange={e => setFormData(prev => ({ ...prev, leukocytes: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Ketone</label>
              <input
                type="text"
                value={formData.ketone}
                onChange={e => setFormData(prev => ({ ...prev, ketone: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Nitrite</label>
              <input
                type="text"
                value={formData.nitrite}
                onChange={e => setFormData(prev => ({ ...prev, nitrite: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Urobilinogen</label>
              <input
                type="text"
                value={formData.urobilinogen}
                onChange={e => setFormData(prev => ({ ...prev, urobilinogen: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Bilirubin</label>
              <input
                type="text"
                value={formData.bilirubin}
                onChange={e => setFormData(prev => ({ ...prev, bilirubin: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Glucose</label>
              <input
                type="text"
                value={formData.glucose}
                onChange={e => setFormData(prev => ({ ...prev, glucose: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Protein</label>
              <input
                type="text"
                value={formData.protein}
                onChange={e => setFormData(prev => ({ ...prev, protein: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Specific Gravity</label>
              <input
                type="number"
                step="0.01" // allows decimals with 2 places
                min="1.00" // optional lower bound
                max="1.05" // optional upper bound
                value={formData.specific_gravity}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    specific_gravity: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label>Ph</label>
              <input
                type="text"
                value={formData.ph}
                onChange={e => setFormData(prev => ({ ...prev, ph: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Blood</label>
              <input
                type="text"
                value={formData.blood}
                onChange={e => setFormData(prev => ({ ...prev, blood: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Vitamin C</label>
              <input
                type="text"
                value={formData.vitamin_c}
                onChange={e => setFormData(prev => ({ ...prev, vitamin_c: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Microalbumin</label>
              <input
                type="text"
                value={formData.microalbumin}
                onChange={e => setFormData(prev => ({ ...prev, microalbumin: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Calcium</label>
              <input
                type="text"
                value={formData.calcium}
                onChange={e => setFormData(prev => ({ ...prev, calcium: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Ascorbic Acid</label>
              <input
                type="text"
                value={formData.ascorbic_acid}
                onChange={e => setFormData(prev => ({ ...prev, ascorbic_acid: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Pus Cells</label>
              <input
                type="text"
                value={formData.pus_cells}
                onChange={e => setFormData(prev => ({ ...prev, pus_cells: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Epithelial Cells</label>
              <input
                type="text"
                value={formData.epithelial_cells}
                onChange={e => setFormData(prev => ({ ...prev, epithelial_cells: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Mucus Threads</label>
              <input
                type="text"
                value={formData.mucus_threads}
                onChange={e => setFormData(prev => ({ ...prev, mucus_threads: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Bacteria</label>
              <input
                type="text"
                value={formData.bacteria}
                onChange={e => setFormData(prev => ({ ...prev, bacteria: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Yeast Cells</label>
              <input
                type="text"
                value={formData.yeast_cells}
                onChange={e => setFormData(prev => ({ ...prev, yeast_cells: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Hyaline Cast</label>
              <input
                type="text"
                value={formData.hyaline_cast}
                onChange={e => setFormData(prev => ({ ...prev, hyaline_cast: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>WBC Cast</label>
              <input
                type="text"
                value={formData.wbc_cast}
                onChange={e => setFormData(prev => ({ ...prev, wbc_cast: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>RBC Cast</label>
              <input
                type="text"
                formData
                value={formData.rbc_cast}
                onChange={e => setFormData(prev => ({ ...prev, rbc_cast: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Coarse Granular Cast</label>
              <input
                type="text"
                value={formData.coarse_granular_cast}
                onChange={e =>
                  setFormData(prev => ({ ...prev, coarse_granular_cast: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Fine Granular Cast</label>
              <input
                type="text"
                value={formData.fine_granular_cast}
                onChange={e =>
                  setFormData(prev => ({ ...prev, fine_granular_cast: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Waxy Cast</label>
              <input
                type="text"
                value={formData.waxy_cast}
                onChange={e => setFormData(prev => ({ ...prev, waxy_cast: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Other Cast</label>
              <input
                type="text"
                value={formData.other_cast}
                onChange={e => setFormData(prev => ({ ...prev, other_cast: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Amourphous Urates</label>
              <input
                type="text"
                value={formData.amorphous_urates}
                onChange={e => setFormData(prev => ({ ...prev, amorphous_urates: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Amourphous Phosphates</label>
              <input
                type="text"
                value={formData.amorphous_phosphates}
                onChange={e =>
                  setFormData(prev => ({ ...prev, amorphous_phosphates: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Calcium Oxalate</label>
              <input
                type="text"
                value={formData.calcium_oxalate}
                onChange={e => setFormData(prev => ({ ...prev, calcium_oxalate: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Calcium Carbonate</label>
              <input
                type="text"
                value={formData.calcium_carbonate}
                onChange={e =>
                  setFormData(prev => ({ ...prev, calcium_carbonate: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Uric Acid Crystals</label>
              <input
                type="text"
                value={formData.uric_acid_crystals}
                onChange={e =>
                  setFormData(prev => ({ ...prev, uric_acid_crystals: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Triple Phosphates</label>
              <input
                type="text"
                value={formData.triple_phosphates}
                onChange={e =>
                  setFormData(prev => ({ ...prev, triple_phosphates: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Cystine</label>
              <input
                type="text"
                value={formData.cystine}
                onChange={e => setFormData(prev => ({ ...prev, cystine: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Clue Cells</label>
              <input
                type="text"
                value={formData.clue_cells}
                onChange={e => setFormData(prev => ({ ...prev, clue_cells: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Trichomonas Vaginalis</label>
              <input
                type="text"
                value={formData.trichomonas_vaginalis}
                onChange={e =>
                  setFormData(prev => ({ ...prev, trichomonas_vaginalis: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label>Renal Cells</label>
              <input
                type="text"
                value={formData.renal_cells}
                onChange={e => setFormData(prev => ({ ...prev, renal_cells: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Pregnancy Tests</label>
              <input
                type="text"
                value={formData.pregnancy_tests}
                onChange={e => setFormData(prev => ({ ...prev, pregnancy_tests: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Others</label>
              <input
                type="text"
                value={formData.others}
                onChange={e => setFormData(prev => ({ ...prev, others: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label>Notes</label>
              <textarea
                rows={4}
                placeholder="Enter any additional observations..."
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                maxLength={255}
              />
              <small>{formData.notes.length}/255 characters</small>
            </div>

            <button onClick={handleSaveUrinalysis} disabled={!urinalysisId || saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default UrinalysisFormSection;
