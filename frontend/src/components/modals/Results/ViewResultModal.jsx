import axios from 'axios';

import { useState, useEffect } from 'react';
import { getResultById } from '../../../api/results';

// function renderOptionalField(label, value) {
//   if (!value) return null;
//   return (
//     <div>
//       <strong>{label}:</strong> {value}
//     </div>
//   );
// }

// function renderSection(title, content) {
//   if (!content) return null;
//   return (
//     <section>
//       <h3>{title}</h3>
//       <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{content}</p>
//     </section>
//   );
// }

export default function ViewResultModal({ isOpen, onClose, resultId }) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchResultById() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await getResultById(resultId);

        console.log('Fetched result:', response.data);

        console.log('Result response:', response);
        setResult(response.data);
      } catch (error) {
        let errorMessage = '';

        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
        } else if (error.request) {
          errorMessage = 'No response from server';
        } else {
          errorMessage = error.message;
        }

        setErrorMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchResultById();
  }, [isOpen, resultId]);

  const testType = result?.TestType?.test_type_name;
  const testData = result?.test_record;

  if (!isOpen) return null;
  if (loading) return <div>Loading result...</div>;
  if (errorMessage) return <div>Error: {errorMessage}</div>;

  console.log('ViewModal test type:', result.TestType?.test_type_name);
  console.log('ViewModal test record:', result.test_record);
  return (
    <div>
      <h2>View Result</h2>
      <>
        {/* Hematology fields go here */}

        <p>
          <strong>Hemoglobin:</strong> {testData?.hemoglobin ?? '-'}
        </p>
        <p>
          <strong>Hematocrit:</strong> {testData?.hematocrit ?? '-'}
        </p>
        <p>
          <strong>rbc count:</strong> {testData?.rbc_count ?? '-'}
        </p>
        <p>
          <strong>wbc count:</strong> {testData?.wbc_count ?? '-'}
        </p>
        <p>
          <strong>Platelet count:</strong> {testData?.platelet_count ?? '-'}
        </p>
        <p>
          <strong>mcv:</strong> {testData?.mcv ?? '-'}
        </p>
        <p>
          <strong>mch:</strong> {testData?.mch ?? '-'}
        </p>
        <p>
          <strong>mchc:</strong> {testData?.mchc ?? '-'}
        </p>
        <p>
          <strong>Neutrophils:</strong> {testData?.neutrophils ?? '-'}
        </p>
        <p>
          <strong>Lymphocytes:</strong> {testData?.lymphocytes ?? '-'}
        </p>
        <p>
          <strong>Monocytes:</strong> {testData?.monocytes ?? '-'}
        </p>
        <p>
          <strong>Eosinophils:</strong> {testData?.eosinophils ?? '-'}
        </p>
        <p>
          <strong>Basophils:</strong> {testData?.basophils ?? '-'}
        </p>
        <section>
          <strong>Others:</strong>
          <p style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{testData?.others}</p>
        </section>
      </>
    </div>
  );
}
