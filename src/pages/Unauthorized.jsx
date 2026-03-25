import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
        <div className="auth-footer">
          <p>
            Return to <Link className="auth-link" to="/">home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
