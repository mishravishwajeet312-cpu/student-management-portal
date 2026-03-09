import React from 'react';

export default function Sidebar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'add', label: 'Add Student', icon: '➕' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="sidebar-icon">{tab.icon}</span>
            <span className="sidebar-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
