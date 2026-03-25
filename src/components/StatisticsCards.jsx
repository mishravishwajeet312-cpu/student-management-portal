import React from 'react';
import { SkeletonStats } from './Skeletons';

export default function StatisticsCards({ students, isLoading = false }) {
  if (isLoading) {
    return <SkeletonStats />;
  }
  const totalStudents = students.length;
  const ages = students.map((student) => Number(student.age)).filter((age) => !Number.isNaN(age));
  const averageAge = ages.length > 0
    ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1)
    : 'N/A';
  const uniqueRoles = new Set(students.map((student) => student.role).filter(Boolean)).size;

  const newestStudent = students.length > 0
    ? students[students.length - 1].name || students[students.length - 1].email
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
        <div className="stat-icon">🧩</div>
        <div className="stat-content">
          <h3 className="stat-value">{uniqueRoles || 1}</h3>
          <p className="stat-label">Unique Roles</p>
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
