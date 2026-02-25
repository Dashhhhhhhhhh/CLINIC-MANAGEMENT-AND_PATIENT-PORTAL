import '../../CSS/ViewResultModal.css';

function renderOptionalField(label, value) {
  return (
    <div>
      <strong>{label}:</strong>{' '}
      {value !== null && value !== undefined && value !== '' ? value : '-'}
    </div>
  );
}

function renderSection(title, content) {
  const value = content !== null && content !== undefined && content.trim() !== '' ? content : '-';

  return (
    <section className="result-section">
      <h3>{title}</h3>
      <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{value}</p>
    </section>
  );
}

function formatDateTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return '-';

  const datePart = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timePart = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} • ${timePart}`;
}

function HematologyFields({ testData }) {
  return (
    <>
      {renderOptionalField('Hemoglobin', testData?.hemoglobin)}
      {renderOptionalField('Hematocrit', testData?.hematocrit)}
      {renderOptionalField('RBC Count', testData?.rbc_count)}
      {renderOptionalField('WBC Count', testData?.wbc_count)}
      {renderOptionalField('Platelet Count', testData?.platelet_count)}
      {renderOptionalField('MCV', testData?.mcv)}
      {renderOptionalField('MCH', testData?.mch)}
      {renderOptionalField('MCHC', testData?.mchc)}
      {renderOptionalField('Neutrophils', testData?.neutrophils)}
      {renderOptionalField('Lymphocytes', testData?.lymphocytes)}
      {renderOptionalField('Monocytes', testData?.monocytes)}
      {renderOptionalField('Eosinophils', testData?.eosinophils)}
      {renderOptionalField('Basophils', testData?.basophils)}
    </>
  );
}

function UrinalysisFields({ testData }) {
  return (
    <>
      {renderOptionalField('Color', testData?.color)}
      {renderOptionalField('Transparency', testData?.transparency)}
      {renderOptionalField('Leukocytes', testData?.leukocytes)}
      {renderOptionalField('Ketone', testData?.ketone)}
      {renderOptionalField('Nitrite', testData?.nitrite)}
      {renderOptionalField('Urobilinogen', testData?.urobilinogen)}
      {renderOptionalField('Bilirubin', testData?.bilirubin)}
      {renderOptionalField('Glucose', testData?.glucose)}
      {renderOptionalField('Protein', testData?.protein)}
      {renderOptionalField('Specific Gravity', testData?.specific_gravity)}
      {renderOptionalField('pH', testData?.ph)}
      {renderOptionalField('Blood', testData?.blood)}
      {renderOptionalField('Vitamin C', testData?.vitamin_c)}
      {renderOptionalField('Microalbumin', testData?.microalbumin)}
      {renderOptionalField('Calcium', testData?.calcium)}
      {renderOptionalField('Ascorbic Acid', testData?.ascorbic_acid)}
      {renderOptionalField('Pus Cells', testData?.pus_cells)}
      {renderOptionalField('RBC', testData?.rbc)}
      {renderOptionalField('Epithelial Cells', testData?.epithelial_cells)}
      {renderOptionalField('Mucus Threads', testData?.mucus_threads)}
      {renderOptionalField('Bacteria', testData?.bacteria)}
      {renderOptionalField('Yeast Cells', testData?.yeast_cells)}
      {renderOptionalField('Hyaline Cast', testData?.hyaline_cast)}
      {renderOptionalField('WBC Cast', testData?.wbc_cast)}
      {renderOptionalField('RBC Cast', testData?.rbc_cast)}
      {renderOptionalField('Coarse Granular Cast', testData?.coarse_granular_cast)}
      {renderOptionalField('Fine Granular Cast', testData?.fine_granular_cast)}
      {renderOptionalField('Waxy Cast', testData?.waxy_cast)}
      {renderOptionalField('Other Cast', testData?.other_cast)}
      {renderOptionalField('Amorphous Urates', testData?.amorphous_urates)}
      {renderOptionalField('Amorphous Phosphates', testData?.amorphous_phosphates)}
      {renderOptionalField('Calcium Oxalate', testData?.calcium_oxalate)}
      {renderOptionalField('Calcium Carbonate', testData?.calcium_carbonate)}
      {renderOptionalField('Uric Acid Crystals', testData?.uric_acid_crystals)}
      {renderOptionalField('Triple Phosphates', testData?.triple_phosphates)}
      {renderOptionalField('Cystine', testData?.cystine)}
      {renderOptionalField('Clue Cells', testData?.clue_cells)}
      {renderOptionalField('Trichomonas Vaginalis', testData?.trichomonas_vaginalis)}
      {renderOptionalField('Renal Cells', testData?.renal_cells)}
      {renderOptionalField('Pregnancy Tests', testData?.pregnancy_tests)}
    </>
  );
}

function XrayFields({ testData }) {
  return (
    <div>
      {renderOptionalField('X-ray Type', testData?.xray_type)}
      {renderSection('History', testData.history)}
      {renderSection('Comparison', testData.comparison)}
      {renderSection('Technique', testData.technique)}
      {renderSection('Findings', testData.findings)}
      {renderSection('Impression', testData.impression)}
      {renderSection('Remarks', testData.remarks)}
    </div>
  );
}

function UltrasoundFields({ testData }) {
  return (
    <div>
      {renderOptionalField('Ultrasound Type', testData?.ultrasound_type)}
      {renderSection('History', testData.history)}
      {renderSection('Comparison', testData.comparison)}
      {renderSection('Technique', testData.technique)}
      {renderSection('Findings', testData.findings)}
      {renderSection('Impression', testData.impression)}
      {renderSection('Remarks', testData.remarks)}
    </div>
  );
}

export default function ViewResultModal({ isOpen, onClose, result, loading }) {
  const rawTestType = result?.TestType?.test_type_name;
  const testType = rawTestType ? rawTestType.charAt(0).toUpperCase() + rawTestType.slice(1) : '';
  const testData = result?.test_record;
  const testTypeName = (rawTestType || '').toLowerCase().replace(/-/g, '');
  if (!isOpen) return null;

  console.log('rawTestType:', rawTestType);
  console.log('testTypeName:', testTypeName);
  console.log('testData:', testData);
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{testType}</h2>
          <p className="modal-date">{formatDateTime(result?.created_at)}</p>
        </div>
        <div className="modal-body">
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading...</p>
          ) : !testData ? (
            <p style={{ textAlign: 'center' }}>No data available</p>
          ) : (
            <>
              <div className="result-grid">
                {testTypeName === 'hematology' && <HematologyFields testData={testData} />}
                {testTypeName === 'urinalysis' && <UrinalysisFields testData={testData} />}
                {testTypeName === 'xray' && <XrayFields testData={testData} />}
                {testTypeName === 'ultrasound' && <UltrasoundFields testData={testData} />}
              </div>
            </>
          )}

          {testData?.others && renderSection('Others', testData.others)}
          {testData?.notes && renderSection('Notes', testData.notes)}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
