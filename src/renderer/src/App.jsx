import React from 'react';
import CertificateForm from './components/CertificateForm';
import generateCertificate from './components/CertificateGenerator';
import BackgroundBubbles from './components/BackgroundBubbles';


function App() {
  return (
    <div>
      <BackgroundBubbles />
      <CertificateForm onGenerate={generateCertificate} />

    </div>
  );
}

export default App;
