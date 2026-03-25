import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Page Not Found</h2>
          <p>The page you requested does not exist.</p>
        </div>
        <div className="auth-footer">
          <p>
            Go back to <Link className="auth-link" to="/">home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
