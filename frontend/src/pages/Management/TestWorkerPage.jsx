import React from 'react';
import WorkerManagement from './WorkerManagement';

const TestWorkerPage = () => {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>Test Worker Management Page</h1>
      <p>This is a test page to ensure the Worker Management component is rendering correctly.</p>
      <div style={{ marginTop: '20px' }}>
        <WorkerManagement />
      </div>
    </div>
  );
};

export default TestWorkerPage; 