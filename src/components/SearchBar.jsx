import React from 'react';

export default function SearchBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOptions
}) {
  const defaultOptions = [
    { value: 'name', label: 'Sort by Name' },
    { value: 'role', label: 'Sort by Role' },
    { value: 'recent', label: 'Most Recent' }
  ];
  const options = sortOptions && sortOptions.length > 0 ? sortOptions : defaultOptions;

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
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
