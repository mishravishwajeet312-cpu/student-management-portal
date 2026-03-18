import React, { useState } from 'react';
import * as XLSX from 'xlsx';

/**
 * StudentTable Component
 * Displays all students in a table format
 * Includes Edit and Delete actions for each student
 * Provides Excel download functionality
 */
const StudentTable = ({ students, onEdit, onDelete }) => {
  // State for delete confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState(null);

  /**
   * Handle delete confirmation
   * Shows a dialog asking user to confirm deletion
   */
  const handleDeleteClick = (student) => {
    setConfirmDelete(student);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDeleteAction = () => {
    if (confirmDelete) {
      onDelete(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  /**
   * Cancel delete action
   */
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  /**
   * Download students data as Excel file
   * Uses SheetJS (xlsx) library
   */
  const handleDownloadExcel = () => {
    if (students.length === 0) {
      alert('No students to download');
      return;
    }

    // Prepare data for Excel - exclude ID for cleaner export
    const excelData = students.map(student => ({
      Name: student.name,
      Email: student.email,
      Age: student.age
    }));

    // Create a new workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // Name column width
      { wch: 25 }, // Email column width
      { wch: 10 }  // Age column width
    ];

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Generate filename with current date
    const fileName = `Students_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Trigger download
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="table-section">
      <div className="table-header">
        <h2>📋 Students List</h2>
        <button className="button button-primary" onClick={handleDownloadExcel}>
          📥 Download Excel
        </button>
      </div>

      {students.length === 0 ? (
        <div className="no-data">
          <p>📚 No students found</p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>Add a new student to get started!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="table-row">
                  <td>
                    <div className="student-name">👤 {student.name}</div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <span className="age-badge">{student.age}</span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="icon-button edit-btn"
                        onClick={() => onEdit(student)}
                        title="Edit student"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button delete-btn"
                        onClick={() => handleDeleteClick(student)}
                        title="Delete student"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>?</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="button button-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="button button-danger" onClick={confirmDeleteAction}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
