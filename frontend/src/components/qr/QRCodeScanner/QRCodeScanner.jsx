import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import './QRCodeScanner.css';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const scannerRef = useRef(null);
  const scannerContainerId = 'qr-reader';

  const initializeScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
      return true;
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setErrorMessage('Failed to initialize the scanner. Please refresh the page and try again.');
      return false;
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    
    try {
      // Initialize scanner first
      const initialized = await initializeScanner();
      if (!initialized) return;

      const qrBoxFunction = (viewfinderWidth, viewfinderHeight) => {
        let minEdgePercentage = 0.7; // 70% of the viewfinder
        let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: qrboxSize,
          height: qrboxSize
        };
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: qrBoxFunction,
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        (decodedText) => {
          stopScanner();
          toast.success('QR Code scanned successfully!');
          onScan(decodedText);
        },
        (errorMessage) => {
          // This is for QR detection errors, not scanner errors
          console.log('QR Code scanning error:', errorMessage);
        }
      );

      setHasPermission(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setIsScanning(false);
      
      if (error.name === 'NotAllowedError' || error.message.includes('Permission')) {
        setHasPermission(false);
        setErrorMessage('Camera access denied. Please enable camera permissions in your browser settings and try again.');
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No camera found. Please make sure your device has a camera and try again.');
      } else {
        setErrorMessage('Failed to start the camera. Please refresh the page and try again.');
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <div className="qr-scanner-title">
          <Camera className="icon" size={20} />
          <h3>QR Code Scanner</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-btn" aria-label="Close Scanner">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="qr-scanner-content">
        {hasPermission === false && (
          <div className="error-message permission-denied">
            <p>{errorMessage || 'Camera access denied. Please enable camera permissions and try again.'}</p>
            <button onClick={startScanner} className="retry-btn">
              <RefreshCw size={16} className="icon" />
              Try Again
            </button>
          </div>
        )}

        {errorMessage && hasPermission !== false && (
          <div className="error-message generic-error">
            <p>{errorMessage}</p>
            <button onClick={startScanner} className="retry-btn">
              <RefreshCw size={16} className="icon" />
              Try Again
            </button>
          </div>
        )}

        <div className="scanner-wrapper">
          <div id={scannerContainerId} className="scanner-box">
            {!isScanning && hasPermission !== false && (
              <div className="scanner-overlay">
                <button onClick={startScanner} className="start-btn">
                  <Camera size={16} className="icon" />
                  Start Scanner
                </button>
              </div>
            )}
          </div>
          {isScanning && (
            <div className="scanning-frame">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </div>
          )}
        </div>

        <div className="instructions">
          <p>Position QR code within the frame to scan</p>
          {isScanning && (
            <p className="scanning-status">Camera is active. Ready to scan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
