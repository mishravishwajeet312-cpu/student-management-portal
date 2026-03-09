import React, { useState, useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import StatisticsCards from './components/StatisticsCards';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import Toast from './components/Toast';
import initialStudents from './data/students.js';

/**
 * App Component - Main application dashboard
 * Manages the state for all students and coordinates between
 * all subcomponents
 */
function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState('students');

  // Students data state
  const [students, setStudents] = useState([]);

  // Form/Modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' // success, error, warning, info
  });

  /**
   * Apply dark mode to document
   */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  /**
   * Load initial students data
   */
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setStudents(initialStudents);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Hide toast notification
   */
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  /**
   * Filtered and sorted students
   */
  const getFilteredAndSortedStudents = () => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort students
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'age') {
      filtered.sort((a, b) => a.age - b.age);
    } else if (sortBy === 'recent') {
      // Keep original order (most recent is last)
      filtered.reverse();
    }

    return filtered;
  };

  /**
   * Handle adding or updating a student
   */
  const handleAddOrUpdateStudent = (formData) => {
    if (editingStudent) {
      // Update existing student
      setStudents(students.map(student =>
        student.id === editingStudent.id
          ? { ...student, ...formData }
          : student
      ));
      showToast(`✅ ${formData.name} updated successfully!`, 'success');
      setEditingStudent(null);
    } else {
      // Add new student
      const newStudent = {
        id: Math.max(...students.map(s => s.id), 0) + 1,
        ...formData
      };
      setStudents([...students, newStudent]);
      showToast(`✅ ${formData.name} added successfully!`, 'success');
    }
    setIsFormOpen(false);
  };

  /**
   * Handle editing a student
   */
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  /**
   * Handle canceling the form
   */
  const handleCancelEdit = () => {
    setEditingStudent(null);
    setIsFormOpen(false);
  };

  /**
   * Handle deleting a student
   */
  const handleDeleteStudent = (id) => {
    const student = students.find(s => s.id === id);
    setStudents(students.filter(student => student.id !== id));
    showToast(`✅ ${student.name} deleted successfully!`, 'success');
  };

  /**
   * Handle opening add student form
   */
  const handleOpenForm = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  /**
   * Handle sidebar tab changes
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'add') {
      handleOpenForm();
      setActiveTab('students');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="app">
        <NavigationBar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
        <div className="app-layout">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="main-content">
            <div className="loading">
              <div className="spinner"></div>
              <p className="loading-text">Loading student data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <NavigationBar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      
      <div className="app-layout">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="main-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <h2 className="page-title">📈 Dashboard Overview</h2>
              <StatisticsCards students={students} />
              <div className="dashboard-info">
                <p>Welcome to Student Management Dashboard</p>
                <p>Navigate using the sidebar to manage students effectively.</p>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="students-view">
              <div className="page-header">
                <h2 className="page-title">👥 Manage Students</h2>
                <button className="button button-primary" onClick={handleOpenForm}>
                  ➕ Add New Student
                </button>
              </div>

              <StatisticsCards students={students} />

              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              <StudentTable
                students={getFilteredAndSortedStudents()}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-view">
              <h2 className="page-title">📊 Analytics</h2>
              <div className="analytics-container">
                <div className="analytics-card">
                  <h3>Total Students</h3>
                  <p className="big-number">{students.length}</p>
                </div>
                <div className="analytics-card">
                  <h3>Average Age</h3>
                  <p className="big-number">
                    {students.length > 0
                      ? (students.reduce((sum, s) => sum + s.age, 0) / students.length).toFixed(1)
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <StudentForm
        onSubmit={handleAddOrUpdateStudent}
        editingStudent={editingStudent}
        onCancel={handleCancelEdit}
        isOpen={isFormOpen}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
