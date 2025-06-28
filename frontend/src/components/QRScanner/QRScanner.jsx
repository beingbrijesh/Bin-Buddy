import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Button, Typography } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import './QRScanner.css';

const QRScanner = ({ onResult, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
          })
          .catch((err) => console.error('Failed to clear scanner:', err));
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText, decodedResult) => {
          if (onResult) {
            onResult(decodedText, decodedResult);
          }
          stopScanning();
        },
        (errorMessage) => {
          if (onError) {
            onError(errorMessage);
          }
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      if (onError) {
        onError(err);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const handleScan = (result) => {
    if (result) {
      const binData = JSON.parse(result.text);
      onResult?.(binData);
    }
  };

  const handleError = (error) => {
    if (error?.name === 'NotAllowedError') {
      setHasPermission(false);
    }
    onError?.(error);
  };

  if (!hasPermission) {
    return (
      <div className="qr-scanner-error">
        <AlertCircle size={24} />
        <p>Camera permission is required to scan QR codes.</p>
        <button 
          className="retry-btn"
          onClick={() => setHasPermission(true)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
      <Box id="reader" sx={{ width: '100%', mb: 2 }} />
      <Box sx={{ mt: 2 }}>
        {!isScanning ? (
          <Button variant="contained" color="primary" onClick={startScanning}>
            Start Scanning
          </Button>
        ) : (
          <Button variant="contained" color="secondary" onClick={stopScanning}>
            Stop Scanning
          </Button>
        )}
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
        Position the QR code within the frame to scan
      </Typography>
    </Box>
  );
};

export default QRScanner; 