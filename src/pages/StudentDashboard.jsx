import React, { useEffect, useMemo, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import api, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Quiz from '../components/Quiz';
import Leaderboard from '../components/Leaderboard';
import Attendance from '../components/Attendance';
import StudentCourses from '../components/StudentCourses';
import AnimatedPage from '../components/AnimatedPage';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const loadResults = async () => {
      if (!user?.studentId) return;
      try {
        const response = await api.get(`/api/results/${user.studentId}`);
        setResults(response.data || []);
      } catch (err) {
        showToast(getApiError(err), 'error');
      }
    };
    loadResults();
  }, [user?.studentId]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.studentId) return;
      try {
        const coursesResponse = await api.get(`/api/student/courses/${user.studentId}`);
        setCourses(coursesResponse.data || []);
      } catch (err) {
        showToast(getApiError(err), 'error');
      }
    };
    loadProfile();
  }, [user?.studentId]);

  const tabs = useMemo(
    () => [
      { id: 'quizzes', label: 'Quizzes', icon: '📝' },
      { id: 'courses', label: 'Courses', icon: '📚' },
      { id: 'attendance', label: 'Attendance', icon: '📅' },
      { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
      { id: 'results', label: 'Results', icon: '🏆' },
      { id: 'profile', label: 'Profile', icon: '👤' }
    ],
    []
  );


  return (
    <div className="app">
      <NavigationBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onLogout={logout}
      />

      <div className="app-layout">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

        <div className="main-content">
          {activeTab === 'quizzes' && (
            <AnimatedPage>
              <div className="students-view">
                <div className="page-header">
                  <h2 className="page-title">📝 Kids Quiz Arena</h2>
                </div>
                <Quiz timerSeconds={30} studentId={user?.studentId} />
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'courses' && (
            <AnimatedPage>
              <StudentCourses studentId={user?.studentId} />
            </AnimatedPage>
          )}

          {activeTab === 'attendance' && (
            <AnimatedPage>
              <div className="students-view">
                <Attendance role="STUDENT" studentId={user?.studentId} onNotify={showToast} />
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'leaderboard' && (
            <AnimatedPage>
              <div className="students-view">
                <Leaderboard />
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'results' && (
            <AnimatedPage>
              <div className="students-view">
                <div className="page-header">
                  <h2 className="page-title">🏆 Your Results</h2>
                </div>
                {results.length === 0 ? (
                  <div className="empty-state">No quiz results yet. Take a quiz to see progress.</div>
                ) : (
                  <div className="table-section">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Quiz ID</th>
                          <th>Score</th>
                          <th>Total</th>
                          <th>Date Taken</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((item) => (
                          <tr key={item.resultId}>
                            <td>{item.quizId}</td>
                            <td>{item.score}</td>
                            <td>{item.total}</td>
                            <td>{item.dateTaken ? new Date(item.dateTaken).toLocaleString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'profile' && (
            <AnimatedPage>
              <div className="students-view">
                <div className="page-header">
                  <h2 className="page-title">👤 Profile</h2>
                </div>
                <div className="profile-card">
                  <h3>{user?.name}</h3>
                  <p>{user?.email}</p>
                  <div style={{ marginTop: '1rem' }}>
                    <span className="badge">Role: {user?.role}</span>
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4>Enrolled Courses</h4>
                    {courses.length === 0 ? (
                      <div className="empty-state">No courses enrolled yet.</div>
                    ) : (
                      <ul>
                        {courses.map((course) => (
                          <li key={course.id}>{course.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedPage>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
};

export default StudentDashboard;
