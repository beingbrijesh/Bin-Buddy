import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import QRCodeScanner from '../../components/qr/QRCodeScanner/QRCodeScanner';
import './QRScanner.css';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [binData, setBinData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleScan = async (result) => {
    setIsLoading(true);
    setScanResult(result);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const binIdMatch = result.match(/bin_id=([a-zA-Z0-9]+)/);
      const binId = binIdMatch ? binIdMatch[1] : `BIN${Math.floor(Math.random() * 1000)}`;
      const mockBinData = {
        id: binId,
        location: `${['Mumbai', 'Delhi', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 4)]}, India`,
        status: ['Empty', 'Half-Full', 'Full'][Math.floor(Math.random() * 3)],
        lastUpdated: `${Math.floor(Math.random() * 24)} hours ago`,
        capacity: `${Math.floor(Math.random() * 100)}%`
      };

      setBinData(mockBinData);
      toast.success('Bin data retrieved successfully!');
    } catch (err) {
      console.error('Error fetching bin data:', err);
      setError('Failed to retrieve bin data. Please try scanning again.');
      toast.error('Error retrieving bin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = (status) => {
    if (!binData) return;
    setIsLoading(true);

    setTimeout(() => {
      setBinData({
        ...binData,
        status,
        lastUpdated: 'Just now'
      });
      setIsLoading(false);
      toast.success(`Bin status updated to ${status}`);
    }, 1000);
  };

  const resetScan = () => {
    setScanResult(null);
    setBinData(null);
    setError(null);
  };

  return (
    <Layout title="QR Code Scanner">
      <div className="qr-scanner-container">
        <div className="scanner-container">
          <div className="scanner-card">
            <h2 className="scanner-title">Scan Bin QR Code</h2>
            <p className="scanner-desc">
              Point your camera at a bin's QR code to view its details and update its status.
            </p>

            {scanResult ? (
              <div className="scanner-result">
                {isLoading ? (
                  <div className="loading-section">
                    <div className="loader"></div>
                    <p className="loading-text">Fetching bin data...</p>
                  </div>
                ) : error ? (
                  <div className="error-box">
                    <AlertCircle className="icon" />
                    <div>
                      <p className="error-title">Error retrieving bin data</p>
                      <p>{error}</p>
                      <button onClick={resetScan} className="error-button">Try Again</button>
                    </div>
                  </div>
                ) : binData ? (
                  <div>
                    <div className="success-box">
                      <CheckCircle className="icon" />
                      <div>
                        <p className="success-title">Bin found!</p>
                        <p>Successfully retrieved information for bin {binData.id}</p>
                      </div>
                    </div>

                    <div className="bin-details-card">
                      <div className="bin-header">Bin Details</div>
                      <div className="bin-body">
                        <div className="detail-grid">
                          <div><span className="label">Bin ID:</span><p>{binData.id}</p></div>
                          <div><span className="label">Location:</span><p>{binData.location}</p></div>
                          <div><span className="label">Status:</span>
                            <p className={`status-text ${binData.status.toLowerCase()}`}>{binData.status}</p>
                          </div>
                          <div><span className="label">Last Updated:</span><p>{binData.lastUpdated}</p></div>
                          <div><span className="label">Capacity:</span><p>{binData.capacity}</p></div>
                        </div>

                        <div className="status-update">
                          <h4>Update Bin Status</h4>
                          <div className="status-buttons">
                            {['Empty', 'Half-Full', 'Full'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleUpdateStatus(status)}
                                disabled={isLoading}
                                className={`status-btn ${status.toLowerCase()} ${binData.status === status ? 'active' : ''}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rescan-button">
                          <button onClick={resetScan}>Scan Another Bin</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <QRCodeScanner onScan={handleScan} />
            )}
          </div>

          <div className="scan-tips">
            <h3>Tips for Scanning</h3>
            <ul>
              <li>• Ensure the QR code is well-lit and clearly visible</li>
              <li>• Hold your device steady while scanning</li>
              <li>• Make sure the entire QR code is visible in the frame</li>
              <li>• If scanning fails, try adjusting the distance or angle</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRScanner;
