import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StudentCourses = ({ studentId }) => {
  const [available, setAvailable] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const [allRes, enrolledRes] = await Promise.all([
          api.get('/api/courses'),
          studentId ? api.get(`/api/student/courses/${studentId}`) : Promise.resolve({ data: [] })
        ]);
        setAvailable(Array.isArray(allRes.data) ? allRes.data : []);
        setEnrolled(Array.isArray(enrolledRes.data) ? enrolledRes.data : []);
      } catch {
        setAvailable([]);
        setEnrolled([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [studentId]);

  if (loading) {
    return (
      <div className="table-section">
        <p className="loading-text">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="students-view">
      <div className="page-header">
        <h2 className="page-title">📚 My Courses</h2>
      </div>

      <div className="quiz-admin-grid">
        <div className="table-section">
          <h3 className="section-title">Enrolled Courses</h3>
          {enrolled.length === 0 ? (
            <div className="empty-state">You are not enrolled in any course yet.</div>
          ) : (
            <ul>
              {enrolled.map((course) => (
                <li key={course.id}>{course.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="table-section">
          <h3 className="section-title">Available Courses</h3>
          {available.length === 0 ? (
            <div className="empty-state">No courses available.</div>
          ) : (
            <ul>
              {available.map((course) => (
                <li key={course.id}>
                  <strong>{course.name}</strong>
                  <div style={{ color: '#718096', fontSize: '0.85rem' }}>
                    {course.description || 'No description'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
