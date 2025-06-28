import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw } from 'lucide-react';
import './QRCodeGenerator.css'; // Import the CSS

const QRCodeGenerator = ({ 
  value,
  size = 200,
  title = 'Bin QR Code',
  description = 'Scan this code to view bin details'
}) => {
  const [qrDataURL, setQrDataURL] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateQRCode();
  }, [value, size]);

  const generateQRCode = async () => {
    if (!value) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const url = await QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: '#279e0a',
          light: '#FFFFFF',
        },
      });
      setQrDataURL(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataURL) return;

    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = `binbuddy-qr-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-container">
      <div className="qr-header">
        <h3 className="qr-title">{title}</h3>
        <p className="qr-description">{description}</p>
      </div>

      <div className="qr-box">
        {isGenerating ? (
          <div className="qr-loading">
            <RefreshCw className="qr-spinner" size={48} />
          </div>
        ) : error ? (
          <div className="qr-error">
            <p>{error}</p>
            <button onClick={generateQRCode} className="qr-retry-btn">
              Try Again
            </button>
          </div>
        ) : qrDataURL ? (
          <div className="qr-image-wrapper">
            <img 
              src={qrDataURL} 
              alt="QR Code" 
              className="qr-image"
            />
            <div className="qr-hover-overlay">
              <button onClick={downloadQRCode} className="qr-download-icon">
                <Download size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="qr-placeholder">
            <p>No data to generate QR</p>
          </div>
        )}

        {qrDataURL && (
          <button onClick={downloadQRCode} className="qr-download-btn">
            <Download size={16} className="mr-2" />
            Download QR Code
          </button>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
