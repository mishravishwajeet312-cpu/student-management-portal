import React from 'react';

export default function NavigationBar({ darkMode, onToggleDarkMode, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h1 className="navbar-title">📊 Student Management Portal</h1>
        </div>
        
        <div className="navbar-right">
          {user && (
            <div className="nav-user">
              <span className="nav-user-name">{user.name || user.email}</span>
              <span className="nav-user-role">{user.role}</span>
            </div>
          )}
          {user && onLogout && (
            <button className="button button-secondary button-small" onClick={onLogout}>
              Log out
            </button>
          )}
          <button 
            className="theme-toggle"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
