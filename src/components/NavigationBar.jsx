import React from 'react';

export default function NavigationBar({ darkMode, onToggleDarkMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h1 className="navbar-title">📊 Student Management Portal</h1>
        </div>
        
        <div className="navbar-right">
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
