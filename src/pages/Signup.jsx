import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get('/api/courses');
        setCourses(response.data || []);
      } catch {
        setCourses([]);
      }
    };
    loadCourses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCourse = (courseName) => {
    setSelectedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((name) => name !== courseName)
        : [...prev, courseName]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/students/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrolledCourses: selectedCourses
      });
      saveAuth(response.data.token, {
        studentId: response.data.studentId,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      });
      navigate('/student', { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-particles">
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
      </div>
      <div className="mascot-sticker">
        <span>🎒</span>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Student Account</h2>
          <p>Join the portal and start taking quizzes</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-input">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Student name"
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-input">
            <label>Enroll in Courses (optional)</label>
            {courses.length === 0 ? (
              <div className="empty-state">No courses available right now.</div>
            ) : (
              <div className="course-grid">
                {courses.map((course) => (
                  <label key={course.id} className="course-option">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.name)}
                      onChange={() => toggleCourse(course.name)}
                    />
                    <span>{course.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link className="auth-link" to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
