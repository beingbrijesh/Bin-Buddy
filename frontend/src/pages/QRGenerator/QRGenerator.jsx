import React, { useState } from 'react';
import { Download, Copy, CheckCheck, Settings, MapPin } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import QRCodeGenerator from '../../components/qr/QRCodeGenerator/QRCodeGenerator';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import './QRGenerator.css';

const QRGenerator = () => {
  const [binId, setBinId] = useState('');
  const [binLocation, setBinLocation] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [savedQRCodes, setSavedQRCodes] = useState([]);

  const generateSecureId = () => {
    // Generate a UUID and take first 8 characters for a shorter, but still unique ID
    return `BIN-${uuidv4().substring(0, 8)}`;
  };

  const generateQRCode = () => {
    if (!binLocation) {
      toast.error('Please enter a bin location');
      return;
    }

    // Generate a secure, non-guessable bin ID
    const secureId = generateSecureId();
    setBinId(secureId);

    // Create a data object with all necessary information
    const qrData = {
      id: secureId,
      location: binLocation,
      timestamp: new Date().toISOString(),
      type: 'bin_qr',
      // Add a simple checksum for basic data validation
      checksum: btoa(secureId + binLocation).substring(0, 8)
    };

    // Convert to URL-safe base64 string
    const encodedData = btoa(JSON.stringify(qrData));
    const data = `${window.location.origin}/scan/${encodedData}`;
    setQrCodeData(data);

    const newQRCode = {
      id: secureId,
      title: `Bin ${secureId}`,
      location: binLocation,
      data: data,
      createdAt: new Date().toLocaleString()
    };

    setSavedQRCodes([newQRCode, ...savedQRCodes]);
    toast.success('QR Code generated successfully!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Layout title="QR Code Generator">
      <div className="qr-container">
        <div className="qr-grid">
          {/* Left Side Form */}
          <div className="qr-form-section">
            <div className="qr-card">
              <h2>Generate QR Code</h2>
              <div className="form-group">
                <label>Location</label>
                <div className="location-input">
                  <MapPin size={16} className="location-icon" />
                  <input
                    type="text"
                    value={binLocation}
                    onChange={(e) => setBinLocation(e.target.value)}
                    placeholder="Enter precise bin location"
                  />
                </div>
              </div>

              <button
                className="settings-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings size={16} />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>

              {showAdvanced && (
                <div className="advanced-options">
                  <label>QR Code Size: {qrSize}px</label>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    step="10"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                  />
                </div>
              )}

              <button onClick={generateQRCode} className="generate-btn">
                Generate QR Code
              </button>
            </div>

            {/* Recent QR Codes */}
            <div className="qr-card">
              <h2>Recent QR Codes</h2>
              {savedQRCodes.length > 0 ? (
                <ul className="recent-list">
                  {savedQRCodes.map((qr) => (
                    <li key={qr.id}>
                      <div className="recent-item">
                        <div>
                          <p className="recent-title">{qr.title}</p>
                          <small className="recent-location">
                            <MapPin size={12} className="location-icon" />
                            {qr.location}
                          </small>
                          <small className="timestamp">{qr.createdAt}</small>
                        </div>
                        <button onClick={() => setQrCodeData(qr.data)}>View</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No QR codes generated yet</p>
              )}
            </div>
          </div>

          {/* QR Display Section */}
          <div className="qr-preview-section">
            <div className="qr-card full-height">
              <h2>QR Code Preview</h2>
              {qrCodeData ? (
                <div className="preview">
                  <QRCodeGenerator
                    value={qrCodeData}
                    size={qrSize}
                    title={binId || 'Bin QR Code'}
                    description={binLocation ? `Location: ${binLocation}` : 'Scan to view bin details'}
                  />
                  <div className="url-box">
                    <div>
                      <p className="url-label">Bin ID:</p>
                      <p className="url-text">{binId}</p>
                    </div>
                    <button onClick={() => copyToClipboard(binId)}>
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>

                  <div className="action-buttons">
                    <button onClick={() => {
                      const downloadBtn = document.querySelector('.qr-download-btn');
                      if (downloadBtn) downloadBtn.click();
                    }}>
                      <Download size={18} /> Download QR Code
                    </button>
                    <button onClick={() => window.print()}>Print QR Code</button>
                  </div>
                </div>
              ) : (
                <div className="no-preview">
                  <Download size={48} className="icon" />
                  <h3>No QR Code Generated</h3>
                  <p>Fill out the form and click "Generate QR Code"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-box">
          <h3>How to Use Bin QR Codes</h3>
          <ul>
            <li><CheckCheck size={18} /> Each QR code contains a secure, unique bin identifier</li>
            <li><CheckCheck size={18} /> Location information is embedded in the QR code</li>
            <li><CheckCheck size={18} /> Different roles (User/Volunteer/Worker) will see different options when scanning</li>
            <li><CheckCheck size={18} /> All scans are logged for tracking and analytics</li>
            <li><CheckCheck size={18} /> Print QR codes on weather-resistant material for outdoor use</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default QRGenerator;
