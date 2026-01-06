import { useState, useEffect } from 'react';
import { getResultById } from '../../../api/results';

function renderOptionalField(label, value) {
  if (!value) return null;
  return (
    <div>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function renderSection(title, content) {
  if (!content) return null;
  return (
    <section>
      <h3>{title}</h3>
      <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{content}</p>
    </section>
  );
}

// function renderHematology() {
//   if
// }

export default function ViewResultModal({ isOpen, onClose, resultId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchResultById() {
      setLoading(true);
      setError(null);

      try {
        const result = await getResultById(resultId);
        setResult(result.data);
        console.log('Fetched result:', result);
      } catch (error) {
        let errorMessage = '';

        // Detailed error handling for clarity
        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
        } else if (error.request) {
          errorMessage = 'No response from server';
        } else {
          errorMessage = error.message;
        }

        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    }
    fetchResultById();
  }, [isOpen, resultId]);

  const data = result?.result_data;
  const testType = result?.TestType?.test_type_name;

  if (!isOpen) return null;
  if (loading) return <div>Loading result...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!result) return null;

  return (
    <div>
      <h2>View Result</h2>
      {testType === 'x-ray' && (
        <>
          {/* Pattern A — Single-line info */}
          <div>
            <strong>X-Ray Type:</strong> {data?.xray_type}
          </div>

          {/* Pattern B — Section text */}
          {renderSection('History', data?.history)}
          {renderSection('Technique', data?.technique)}
          {renderSection('Findings', data?.findings)}
          {renderSection('Impression', data?.impression)}

          {renderOptionalField('Comparison', data?.comparison)}
          {renderOptionalField('Remarks', data?.remarks)}
        </>
      )}
      {testType === 'ultrasound' && (
        <>
          {/* Ultrasound fields go here */}
          <div>
            <strong>Ultrasound Type:</strong> {data?.ultrasound_type}
          </div>

          {/* Pattern B — Section text */}
          {renderSection('History', data?.history)}
          {renderSection('Technique', data?.technique)}
          {renderSection('Findings', data?.findings)}
          {renderSection('Impression', data?.impression)}

          {renderOptionalField('Comparison', data?.comparison)}
          {renderOptionalField('Remarks', data?.remarks)}
        </>
      )}
      {testType === 'hematology' && (
        <>
          {/* Hematology fields go here */}

          <p>
            <strong>Hemoglobin:</strong> {data?.hemoglobin ?? '-'}
          </p>
          <p>
            <strong>Hematocrit:</strong> {data?.hematocrit ?? '-'}
          </p>
          <p>
            <strong>rbc count:</strong> {data?.rbc ?? '-'}
          </p>
          <p>
            <strong>wbc count:</strong> {data?.wbc ?? '-'}
          </p>
          <p>
            <strong>Platelet count:</strong> {data?.platelet_count ?? '-'}
          </p>
          <p>
            <strong>mcv:</strong> {data?.mcv ?? '-'}
          </p>
          <p>
            <strong>mch:</strong> {data?.mch ?? '-'}
          </p>
          <p>
            <strong>mchc:</strong> {data?.mchc ?? '-'}
          </p>
          <p>
            <strong>Neutrophils:</strong> {data?.neutrophils ?? '-'}
          </p>
          <p>
            <strong>Lymphocytes:</strong> {data?.lymphocytes ?? '-'}
          </p>
          <p>
            <strong>Monocytes:</strong> {data?.monocytes ?? '-'}
          </p>
          <p>
            <strong>Eosinophils:</strong> {data?.eosinophils ?? '-'}
          </p>
          <p>
            <strong>Basophils:</strong> {data?.basophils ?? '-'}
          </p>
          <section>
            <strong>Others:</strong>
            <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{data?.other}</p>
          </section>
        </>
      )}

      {/* Urinalysis fields go here */}
      {testType === 'urinalysis' && (
        <>
          <h4>Physical Examination</h4>
          <p>
            <strong>Color:</strong> {data?.color ?? '-'}
          </p>
          <p>
            <strong>Transparency:</strong> {data?.transparency ?? '-'}
          </p>
          <p>
            <strong>Specific Gravity:</strong> {data?.specific_gravity ?? '-'}
          </p>

          <h4>Chemical Examination</h4>

          <p>
            <strong>pH:</strong> {data?.ph ?? '-'}
          </p>
          <p>
            <strong>Protein:</strong> {data?.protein ?? '-'}
          </p>
          <p>
            <strong>Glucose:</strong> {data?.glucose ?? '-'}
          </p>
          <p>
            <strong>Ketone:</strong> {data?.ketone ?? '-'}
          </p>
          <p>
            <strong>Blood:</strong> {data?.blood ?? '-'}
          </p>
          <p>
            <strong>Bilirubin:</strong> {data?.bilirubin ?? '-'}
          </p>
          <p>
            <strong>Urobilinogen:</strong> {data?.urobilinogen ?? '-'}
          </p>
          <p>
            <strong>Nitrite:</strong> {data?.nitrite ?? '-'}
          </p>
          <p>
            <strong>Leukocytes:</strong> {data?.leukocytes ?? '-'}
          </p>
          <p>
            <strong>Vitamin C:</strong> {data?.vitamin_c ?? '-'}
          </p>
          <p>
            <strong>Ascorbic acid:</strong> {data?.ascorbic_acid ?? '-'}
          </p>
          <p>
            <strong>Microalbumin:</strong> {data?.microalbumin ?? '-'}
          </p>
          <p>
            <strong>Calcium:</strong> {data?.calcium ?? '-'}
          </p>
          <p>
            <strong>Pregnancy tests::</strong> {data?.pregnancy_test ?? '-'}
          </p>

          <h4>Microscopic Examination</h4>

          <p>
            <strong>RBC:</strong> {data?.rbc ?? '-'}
          </p>
          <p>
            <strong>Pus Cells:</strong> {data?.pus_cells ?? '-'}
          </p>
          <p>
            <strong>Epithelial Cells:</strong> {data?.epithelial_cells ?? '-'}
          </p>
          <p>
            <strong>Yeast Cells:</strong> {data?.yeast_cells ?? '-'}
          </p>
          <p>
            <strong>Renal Cells:</strong> {data?.renal_cells ?? '-'}
          </p>
          <p>
            <strong>Clue cells:</strong> {data?.clue_cells ?? '-'}
          </p>
          <p>
            <strong>Trichomonas vaginalis:</strong> {data?.trichomonas_vaginalis ?? '-'}
          </p>
          <p>
            <strong>Bacteria:</strong> {data?.bacteria ?? '-'}
          </p>
          <p>
            <strong>Hyaline Cast:</strong> {data?.hyaline_cast ?? '-'}
          </p>
          <p>
            <strong>WBC Cast:</strong> {data?.wbc_cast ?? '-'}
          </p>
          <p>
            <strong>Coarse Granular Cast:</strong> {data?.coarse_granular_cast ?? '-'}
          </p>
          <p>
            <strong>Fine Granular Cast:</strong> {data?.fine_granular_cast ?? '-'}
          </p>
          <p>
            <strong>Waxy Cast:</strong> {data?.waxy_cast ?? '-'}
          </p>
          <p>
            <strong>Other Cast:</strong> {data?.other_cast ?? '-'}
          </p>
          <p>
            <strong>Amorphous Urates:</strong> {data?.amorphous_urates ?? '-'}
          </p>
          <p>
            <strong>Amorphous Phosphates:</strong> {data?.amorphous_phosphates ?? '-'}
          </p>
          <p>
            <strong>Calcium Oxalate:</strong> {data?.calcium_oxalate ?? '-'}
          </p>
          <p>
            <strong>Calcium Carbonate:</strong> {data?.calcium_carbonate ?? '-'}
          </p>
          <p>
            <strong>Uric Acid Crystals:</strong> {data?.uric_acid_crystals ?? '-'}
          </p>
          <p>
            <strong>Triple Phosphates:</strong> {data?.triple_phosphates ?? '-'}
          </p>
          <p>
            <strong>Cystine:</strong> {data?.cystine ?? '-'}
          </p>
          <p>
            <strong>Mucus Threads:</strong> {data?.mucus_threads ?? '-'}
          </p>

          <section>
            <strong>Others:</strong>
            <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{data?.others}</p>
          </section>

          <section>
            <strong>Remarks:</strong>
            <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{data?.remarks}</p>
          </section>
        </>
      )}

      {!['x-ray', 'ultrasound', 'hematology', 'urinalysis'].includes(testType) && (
        <p>Unsupported test type</p>
      )}
    </div>
  );
}
