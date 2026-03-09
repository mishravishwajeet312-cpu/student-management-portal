import React from 'react';

export default function StatisticsCards({ students }) {
  const totalStudents = students.length;
  
  const averageAge = students.length > 0 
    ? (students.reduce((sum, student) => sum + student.age, 0) / students.length).toFixed(1)
    : 0;

  const newestStudent = students.length > 0
    ? students[students.length - 1].name
    : 'N/A';

  return (
    <div className="statistics-cards">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3 className="stat-value">{totalStudents}</h3>
          <p className="stat-label">Total Students</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <h3 className="stat-value">{averageAge}</h3>
          <p className="stat-label">Average Age</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-content">
          <h3 className="stat-value" style={{ fontSize: '0.9rem' }}>{newestStudent}</h3>
          <p className="stat-label">Newest Student</p>
        </div>
      </div>
    </div>
  );
}
