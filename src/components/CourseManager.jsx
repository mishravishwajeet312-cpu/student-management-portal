import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CourseManager = ({ onNotify }) => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseForm, setCourseForm] = useState({ name: '', description: '' });
  const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '' });

  const notify = (message, type = 'success') => {
    if (onNotify) onNotify(message, type);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, studentRes] = await Promise.all([
        api.get('/api/courses'),
        api.get('/api/students')
      ]);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
    } catch (err) {
      notify('Failed to load courses/students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCourseChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnrollChange = (event) => {
    const { name, value } = event.target;
    setEnrollForm((prev) => ({ ...prev, [name]: value }));
  };

  const createCourse = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/admin/course', {
        name: courseForm.name,
        description: courseForm.description
      });
      notify('Course created successfully!');
      setCourseForm({ name: '', description: '' });
      loadData();
    } catch (err) {
      notify('Failed to create course', 'error');
    }
  };

  const enrollStudent = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/admin/enroll', {
        studentId: Number(enrollForm.studentId),
        courseId: Number(enrollForm.courseId)
      });
      notify('Student enrolled successfully!');
      setEnrollForm({ studentId: '', courseId: '' });
    } catch (err) {
      notify('Failed to enroll student', 'error');
    }
  };

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
        <h2 className="page-title">📚 Courses & Enrollment</h2>
      </div>

      <div className="quiz-admin-grid">
        <div className="table-section">
          <h3 className="section-title">Create Course</h3>
          <form className="form-grid" onSubmit={createCourse}>
            <div className="form-input">
              <label htmlFor="courseName">Course Name</label>
              <input
                id="courseName"
                name="name"
                value={courseForm.name}
                onChange={handleCourseChange}
                required
              />
            </div>
            <div className="form-input">
              <label htmlFor="courseDescription">Description</label>
              <input
                id="courseDescription"
                name="description"
                value={courseForm.description}
                onChange={handleCourseChange}
              />
            </div>
            <div className="form-actions">
              <button className="button button-primary" type="submit">
                Add Course
              </button>
            </div>
          </form>
        </div>

        <div className="table-section">
          <h3 className="section-title">Enroll Student</h3>
          <form className="form-grid" onSubmit={enrollStudent}>
            <div className="form-input">
              <label htmlFor="studentSelect">Student</label>
              <select
                id="studentSelect"
                name="studentId"
                value={enrollForm.studentId}
                onChange={handleEnrollChange}
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-input">
              <label htmlFor="courseSelect">Course</label>
              <select
                id="courseSelect"
                name="courseId"
                value={enrollForm.courseId}
                onChange={handleEnrollChange}
                required
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button className="button button-primary" type="submit">
                Enroll Student
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="table-section" style={{ marginTop: '2rem' }}>
        <h3 className="section-title">Available Courses</h3>
        {courses.length === 0 ? (
          <div className="empty-state">No courses available yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td>{course.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManager;
