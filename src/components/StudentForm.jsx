import React, { useState, useEffect } from 'react';

/**
 * StudentForm Modal Component
 * This component handles both adding and editing students
 * It displays as a modal with Name, Email, and Age fields
 * Includes validation for all fields
 */
const StudentForm = ({ onSubmit, editingStudent, onCancel, isOpen }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing a student
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        email: editingStudent.email,
        age: editingStudent.age
      });
    }
  }, [editingStudent]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age <= 0) {
      newErrors.age = 'Age must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Pass form data to parent component
      onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        age: parseInt(formData.age)
      });

      // Reset form
      setFormData({ name: '', email: '', age: '' });
      setErrors({});
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={onCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? '✏️ Edit Student' : '➕ Add New Student'}</h2>
              <button className="modal-close" onClick={onCancel}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <div className="form-input">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className={errors.name ? 'error' : ''}
                    autoFocus
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-input">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter student email"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-input">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter student age"
                    className={errors.age ? 'error' : ''}
                  />
                  {errors.age && <span className="error-message">{errors.age}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentForm;
