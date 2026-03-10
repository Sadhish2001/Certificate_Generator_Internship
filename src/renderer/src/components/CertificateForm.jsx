import React, { useState } from 'react';
import '../assets/form.css';

function formatToIndianDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ── Certificate Preview Modal ───────────────────────────────── */
const CertificatePreviewModal = ({ formData, onClose }) => {
  const {
    studentName, year, courseName, institutionName,
    visitDate, certificateTitle, projectTitle, technologies,
    duration, internshipStartDate, internshipEndDate,
    internshipCourse, logo, signature,
  } = formData;

  const startFmt = formatToIndianDate(internshipStartDate);
  const endFmt = formatToIndianDate(internshipEndDate);
  const visitFmt = formatToIndianDate(visitDate);
  const title = certificateTitle || 'Certificate of Participation';

  return (
    <div className="preview-backdrop" onClick={onClose}>
      <div className="preview-wrapper" onClick={e => e.stopPropagation()}>

        <button className="preview-close-btn" onClick={onClose}>✕</button>
        <p className="preview-hint">⚡ Live Preview — mirrors the generated PDF</p>

        {/* ── A4 Landscape ── */}
        <div className="cert-page">

          {/* Watermark */}
          {logo && <img src={logo} className="cert-watermark" alt="" />}

          {/* Thick outer border */}
          <div className="cert-border-outer">
            <div className="cert-border-inner">

              {/* ── Header row: logo left, title right ── */}
              <div className="cert-header-row">
                {logo
                  ? <img src={logo} className="cert-logo" alt="logo" />
                  : <div className="cert-logo-placeholder" />
                }
                <h1 className="cert-title">{title}</h1>
              </div>

              {/* ── Body ── */}
              <div className="cert-body">

                {/* Line 1 */}
                <p className="cert-line">
                  This is to certify that Mr/Ms&nbsp;
                  <strong>{studentName || '___________'}</strong>
                  {(year || courseName) && `, ${year ? year + ' Year ' : ''}${courseName} from`}
                </p>

                {/* Institution */}
                {institutionName && (
                  <p className="cert-institution">{institutionName}</p>
                )}

                {/* Internship / project line */}
                <p className="cert-line">
                  has successfully completed the Internship in&nbsp;
                  {internshipCourse && <span>{internshipCourse}&nbsp;</span>}
                  {projectTitle && <>doing project(s) titled <strong>{projectTitle}</strong></>}
                </p>

                {/* Technologies */}
                {technologies && (
                  <p className="cert-line">(using {technologies})</p>
                )}

                {/* Duration */}
                {duration && (
                  <p className="cert-line">for a duration of {duration}</p>
                )}

                {/* Date range */}
                {startFmt && endFmt && (
                  <p className="cert-line">from {startFmt} to {endFmt}</p>
                )}

                {/* at */}
                <p className="cert-line cert-at">at</p>

                {/* Company name — Cinzel, green, uppercase */}
                <p className="cert-company">AAHA eCom Solutions</p>

                <p className="cert-line cert-small">(a software development company)</p>
                <p className="cert-line cert-small">
                  Located at No:27, 3rd Cross, SithanKudi, Brindavan Colony, Puducherry&#8209;605013
                </p>

                <p className="cert-wishes">
                  We wish him/her success and betterment in future.
                </p>
              </div>

              {/* ── Footer ── */}
              <div className="cert-footer">
                <div className="cert-footer-left">
                  {visitFmt && <span>Date: <strong>{visitFmt}</strong></span>}
                </div>
                <div className="cert-footer-right">
                  {signature && (
                    <img src={signature} className="cert-signature" alt="signature" />
                  )}
                  <span className="cert-auth">Authorized Signatory</span>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* end cert-page */}

      </div>
    </div>
  );
};

/* ── Main Form ───────────────────────────────────────────────── */
const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    year: '',
    courseName: '',
    institutionName: '',
    visitDate: '',
    certificateTitle: 'Certificate of Participation',
    projectTitle: '',
    technologies: '',
    duration: '',
    internshipStartDate: '',
    internshipEndDate: '',
    internshipCourse: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const isValidDate = (dateStr) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setMessage('Please enter date in YYYY-MM-DD format with 4-digit year');
      return false;
    }
    const date = new Date(dateStr);
    const y = date.getFullYear();
    if (isNaN(date.getTime()) || y < 1900 || y > 2100) {
      setMessage('Please enter a valid date between 1900 and 2100');
      return false;
    }
    const [iy, im, id] = dateStr.split('-').map(Number);
    if (date.getFullYear() !== iy || date.getMonth() + 1 !== im || date.getDate() !== id) {
      setMessage('Please enter a valid date');
      return false;
    }
    setMessage('');
    return true;
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const isPNG = file.type.startsWith('image/png') || file.name.toLowerCase().endsWith('.png');
      if (!isPNG) { setMessage('Please upload a PNG file!'); return; }
      if (file.size > 5e6) { setMessage('File size must be less than 5MB!'); return; }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        if (typeof result === 'string' && result.startsWith('data:')) {
          const b64 = result.split(',')[1];
          if (b64) setFormData(p => ({ ...p, [name]: `data:image/png;base64,${b64}` }));
          else setMessage('Failed to extract image data!');
        } else {
          setMessage('Failed to read image data!');
        }
      };
      reader.onerror = () => setMessage('Error reading the file. Please try again.');
      reader.readAsDataURL(file);
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!isValidDate(formData.visitDate)) {
      setMessage('Please enter a valid visit date (YYYY-MM-DD)');
      setLoading(false);
      return;
    }
    try {
      await onGenerate(formData);
      setMessage('Certificate generated successfully!');
    } catch (err) {
      console.error(err);
      setMessage(
        err?.message?.includes('PNG file')
          ? 'Please ensure all image files are in PNG format.'
          : 'Failed to generate certificate. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {showPreview && (
        <CertificatePreviewModal formData={formData} onClose={() => setShowPreview(false)} />
      )}

      <div className="form-header">
        <h2>Certificate Generator</h2>
        <p>Fill in the details below to generate a new certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">

        <div className="form-group full-width">
          <label className="form-label">Student Name</label>
          <input className="form-input" name="studentName" placeholder="Enter student name" required onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Year</label>
          <select name="year" value={formData.year} onChange={handleChange} className="form-select">
            <option value="">Select Year</option>
            <option value="I">I Year</option>
            <option value="II">II Year</option>
            <option value="III">III Year</option>
            <option value="IV">IV Year</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Course Name</label>
          <input className="form-input" name="courseName" placeholder="e.g. B.Tech Computer Science" required onChange={handleChange} />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Institution Name</label>
          <input className="form-input" name="institutionName" placeholder="Enter institution name" required onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Visit Date</label>
          <input className="form-input" name="visitDate" type="date" required onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Internship Domain</label>
          <input className="form-input" name="internshipCourse" placeholder="e.g. Web Development" onChange={handleChange} />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Project Title</label>
          <input className="form-input" name="projectTitle" placeholder="Enter project title" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Technologies</label>
          <input className="form-input" name="technologies" placeholder="e.g. HTML, CSS, React" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Duration</label>
          <input className="form-input" name="duration" placeholder="e.g. 15 days" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Internship Start Date</label>
          <input className="form-input" name="internshipStartDate" type="date" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Internship End Date</label>
          <input className="form-input" name="internshipEndDate" type="date" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Logo</label>
          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input name="logo" type="file" accept="image/png" onChange={handleChange} className="hidden-input" />
              <span>{formData.logo ? '✅ Logo Uploaded' : '📤 Upload Logo (PNG)'}</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Signature</label>
          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input name="signature" type="file" accept="image/png" onChange={handleChange} className="hidden-input" />
              <span>{formData.signature ? '✅ Signature Uploaded' : '📤 Upload Signature (PNG)'}</span>
            </label>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="btn-row">
          <button type="button" className="preview-btn" onClick={() => setShowPreview(true)}>
            👁&nbsp; Preview Certificate
          </button>
          <button type="submit" disabled={loading} className="submit-btn submit-btn-inline">
            {loading ? 'Generating...' : '⬇ Generate Certificate'}
          </button>
        </div>

        {message && (
          <div className={`message-toast ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CertificateForm;
