import React from 'react';

export default function SearchBar({ searchTerm, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="search-sort-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="sort-box">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="age">Sort by Age</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>
    </div>
  );
}
