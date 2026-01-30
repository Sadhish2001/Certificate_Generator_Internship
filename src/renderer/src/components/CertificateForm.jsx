import React, { useState } from 'react';
import '../assets/form.css';

const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    year: 'I',
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

  // Function to validate date format and range
  const isValidDate = (dateStr) => {
    // First check format is YYYY-MM-DD with 4-digit year
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setMessage('Please enter date in YYYY-MM-DD format with 4-digit year');
      return false;
    }

    const date = new Date(dateStr);
    const year = date.getFullYear();

    // Check if the date is valid and year is between 1900 and 2100
    if (isNaN(date.getTime()) || year < 1900 || year > 2100) {
      setMessage('Please enter a valid date between 1900 and 2100');
      return false;
    }

    // Check if the parsed date matches the input (to catch invalid dates like 2023-02-31)
    const [inputYear, inputMonth, inputDay] = dateStr.split('-').map(Number);
    if (date.getFullYear() !== inputYear ||
      date.getMonth() + 1 !== inputMonth ||
      date.getDate() !== inputDay) {
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

      // Validate file type using multiple methods
      const isPNG = file.type.startsWith('image/png') ||
        file.name.toLowerCase().endsWith('.png');

      if (!isPNG) {
        setMessage('Please upload a PNG file!');
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('File size must be less than 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;

        // Ensure we get the complete data URL
        if (typeof result === 'string' && result.startsWith('data:')) {
          // Extract just the base64 part
          const base64Data = result.split(',')[1];
          if (base64Data) {
            // Reconstruct with proper PNG prefix
            const pngDataUrl = `data:image/png;base64,${base64Data}`;
            setFormData((prev) => ({ ...prev, [name]: pngDataUrl }));
          } else {
            setMessage('Failed to extract image data!');
          }
        } else {
          setMessage('Failed to read image data!');
        }
      };

      // Add error handling for file reading
      reader.onerror = () => {
        setMessage('Error reading the file. Please try again.');
      };

      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate visit date
    if (!isValidDate(formData.visitDate)) {
      setMessage('Please enter a valid visit date with 4-digit year (YYYY-MM-DD)');
      setLoading(false);
      return;
    }

    try {
      await onGenerate(formData);
      setMessage('Certificate generated successfully!');
    } catch (err) {
      console.error('Error in onGenerate:', err);
      if (err && err.message && err.message.includes('PNG file')) {
        setMessage('Failed to load required assets. Please ensure all image files are in PNG format.');
      } else {
        setMessage('Failed to generate certificate. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Certificate Generator</h2>
        <p>Fill in the details below to generate a new certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">Student Name</label>
          <input
            className="form-input"
            name="studentName"
            placeholder="Enter student name"
            required
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Year</label>
          <select
            name="year"
            required
            value={formData.year}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select Year</option>
            <option value="I">I Year</option>
            <option value="II">II Year</option>
            <option value="III">III Year</option>
            <option value="IV">IV Year</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Course Name</label>
          <input
            className="form-input"
            name="courseName"
            placeholder="e.g. B.Tech Computer Science"
            required
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Institution Name</label>
          <input
            className="form-input"
            name="institutionName"
            placeholder="Enter institution name"
            required
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Visit Date</label>
          <input
            className="form-input"
            name="visitDate"
            type="date"
            required
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Internship Domain</label>
          <input
            className="form-input"
            name="internshipCourse"
            placeholder="e.g. Web Development"
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Project Title</label>
          <input
            className="form-input"
            name="projectTitle"
            placeholder="Enter project title"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Technologies</label>
          <input
            className="form-input"
            name="technologies"
            placeholder="e.g. HTML, CSS, React"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration</label>
          <input
            className="form-input"
            name="duration"
            placeholder="e.g. 15 days"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Internship Start Date</label>
          <input
            className="form-input"
            name="internshipStartDate"
            type="date"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Internship End Date</label>
          <input
            className="form-input"
            name="internshipEndDate"
            type="date"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Logo</label>
          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input
                name="logo"
                type="file"
                accept="image/png"
                onChange={handleChange}
                className="hidden-input"
              />
              <span>{formData.logo ? '✅ Logo Uploaded' : '📤 Upload Logo (PNG)'}</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Signature</label>
          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input
                name="signature"
                type="file"
                accept="image/png"
                onChange={handleChange}
                className="hidden-input"
              />
              <span>{formData.signature ? '✅ Signature Uploaded' : '📤 Upload Signature (PNG)'}</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Generating Certificate...' : 'Generate Certificate'}
        </button>

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
