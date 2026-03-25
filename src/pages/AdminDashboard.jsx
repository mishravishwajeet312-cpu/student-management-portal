import React, { useEffect, useMemo, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import StatisticsCards from '../components/StatisticsCards';
import StudentTable from '../components/StudentTable';
import StudentForm from '../components/StudentForm';
import Toast from '../components/Toast';
import Leaderboard from '../components/Leaderboard';
import Attendance from '../components/Attendance';
import CourseManager from '../components/CourseManager';
import AnimatedPage from '../components/AnimatedPage';
import { SkeletonDashboard } from '../components/Skeletons';
import api, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [quizzes, setQuizzes] = useState([]);
  const [quizForm, setQuizForm] = useState({
    title: '',
    type: 'manual',
    totalQuestions: 10
  });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    quizId: '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOption: 1
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
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

  const loadStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data || []);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      const response = await api.get('/api/quizzes');
      setQuizzes(response.data || []);
    } catch (err) {
      showToast(getApiError(err), 'error');
    }
  };

  useEffect(() => {
    loadStudents();
    loadQuizzes();
  }, []);

  const filteredStudents = useMemo(() => {
    let filtered = students.filter((student) =>
      `${student.name ?? ''} ${student.email ?? ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'role') {
      filtered.sort((a, b) => (a.role || '').localeCompare(b.role || ''));
    } else if (sortBy === 'recent') {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [students, searchTerm, sortBy]);

  const handleAddStudent = async (formData) => {
    try {
      const response = await api.post('/api/students/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      setStudents((prev) => [
        ...prev,
        {
          id: response.data.studentId,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }
      ]);
      showToast(`✅ ${response.data.name} added successfully!`, 'success');
      setIsFormOpen(false);
    } catch (err) {
      showToast(getApiError(err), 'error');
    }
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'add') {
      handleOpenForm();
      setActiveTab('students');
    }
  };

  const handleQuizChange = (event) => {
    const { name, value } = event.target;
    setQuizForm((prev) => ({
      ...prev,
      [name]: name === 'totalQuestions' ? Number(value) : value
    }));
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    try {
      if (editingQuizId) {
        await api.put(`/api/quizzes/${editingQuizId}`, quizForm);
        showToast('Quiz updated successfully!', 'success');
      } else {
        await api.post('/api/quizzes', quizForm);
        showToast('Quiz created successfully!', 'success');
      }
      setQuizForm({ title: '', type: 'manual', totalQuestions: 10 });
      setEditingQuizId(null);
      loadQuizzes();
    } catch (err) {
      showToast(getApiError(err), 'error');
    }
  };

  const handleEditQuiz = (quiz) => {
    setQuizForm({
      title: quiz.title,
      type: quiz.type,
      totalQuestions: quiz.totalQuestions
    });
    setEditingQuizId(quiz.quizId);
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await api.delete(`/api/quizzes/${quizId}`);
      showToast('Quiz deleted', 'success');
      loadQuizzes();
    } catch (err) {
      showToast(getApiError(err), 'error');
    }
  };

  const handleQuestionChange = (event) => {
    const { name, value } = event.target;
    setQuestionForm((prev) => ({
      ...prev,
      [name]: name === 'correctOption' ? Number(value) : value
    }));
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        questionText: questionForm.questionText,
        option1: questionForm.option1,
        option2: questionForm.option2,
        option3: questionForm.option3,
        option4: questionForm.option4,
        correctOption: Number(questionForm.correctOption),
        quiz: { quizId: Number(questionForm.quizId) }
      };
      await api.post('/api/questions', payload);
      showToast('Question added to quiz', 'success');
      setQuestionForm({
        quizId: questionForm.quizId,
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOption: 1
      });
    } catch (err) {
      showToast(getApiError(err), 'error');
    }
  };

  const loadQuizQuestions = async (quizId) => {
    try {
      const response = await api.get(`/api/quizzes/${quizId}/questions`);
      setQuizQuestions(response.data || []);
    } catch (err) {
      showToast(getApiError(err), 'error');
    }
  };

  const tabs = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: '📈' },
      { id: 'students', label: 'Students', icon: '👥' },
      { id: 'add', label: 'Add Student', icon: '➕' },
      { id: 'courses', label: 'Courses', icon: '📚' },
      { id: 'quizzes', label: 'Quizzes', icon: '🧩' },
      { id: 'attendance', label: 'Attendance', icon: '📅' },
      { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
      { id: 'analytics', label: 'Analytics', icon: '📊' }
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="app">
        <NavigationBar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          user={user}
          onLogout={logout}
        />
        <div className="app-layout">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
          <div className="main-content">
            <AnimatedPage>
              <SkeletonDashboard />
            </AnimatedPage>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <NavigationBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onLogout={logout}
      />

      <div className="app-layout">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />

        <div className="main-content">
          {activeTab === 'dashboard' && (
            <AnimatedPage>
              <div className="dashboard-view">
                <h2 className="page-title">📈 Admin Overview</h2>
                <StatisticsCards students={students} />
                <div className="dashboard-info">
                  <p>Manage students, quizzes, and keep data organized.</p>
                  <p>Use the sidebar to add students and build quizzes.</p>
                </div>
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'students' && (
            <AnimatedPage>
              <div className="students-view">
                <div className="page-header">
                  <h2 className="page-title">👥 Students</h2>
                  <button className="button button-primary" onClick={handleOpenForm}>
                    ➕ Add Student
                  </button>
                </div>

                <StatisticsCards students={students} />

                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />

                <StudentTable students={filteredStudents} />
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'quizzes' && (
            <AnimatedPage>
              <div className="students-view">
                <div className="page-header">
                  <h2 className="page-title">🧩 Quiz Manager</h2>
                </div>

                <div className="quiz-admin-grid">
                <div className="table-section">
                  <h3 className="section-title">
                    {editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}
                  </h3>
                  <form className="form-grid" onSubmit={submitQuiz}>
                    <div className="form-input">
                      <label htmlFor="title">Title</label>
                      <input
                        id="title"
                        name="title"
                        value={quizForm.title}
                        onChange={handleQuizChange}
                        required
                      />
                    </div>
                    <div className="form-input">
                      <label htmlFor="type">Type</label>
                      <select
                        id="type"
                        name="type"
                        value={quizForm.type}
                        onChange={handleQuizChange}
                      >
                        <option value="manual">Manual</option>
                        <option value="external">External</option>
                      </select>
                    </div>
                    <div className="form-input">
                      <label htmlFor="totalQuestions">Total Questions</label>
                      <input
                        id="totalQuestions"
                        name="totalQuestions"
                        type="number"
                        min="1"
                        value={quizForm.totalQuestions}
                        onChange={handleQuizChange}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button className="button button-primary" type="submit">
                        {editingQuizId ? 'Update Quiz' : 'Create Quiz'}
                      </button>
                      {editingQuizId && (
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => {
                            setEditingQuizId(null);
                            setQuizForm({ title: '', type: 'manual', totalQuestions: 10 });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="table-section">
                  <h3 className="section-title">Add Questions</h3>
                  <form className="form-grid" onSubmit={submitQuestion}>
                    <div className="form-input">
                      <label htmlFor="quizId">Select Quiz</label>
                      <select
                        id="quizId"
                        name="quizId"
                        value={questionForm.quizId}
                        onChange={handleQuestionChange}
                        required
                      >
                        <option value="">Choose a quiz</option>
                        {quizzes.map((quiz) => (
                          <option key={quiz.quizId} value={quiz.quizId}>
                            {quiz.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-input">
                      <label htmlFor="questionText">Question</label>
                      <input
                        id="questionText"
                        name="questionText"
                        value={questionForm.questionText}
                        onChange={handleQuestionChange}
                        required
                      />
                    </div>
                    <div className="form-input">
                      <label htmlFor="option1">Option 1</label>
                      <input
                        id="option1"
                        name="option1"
                        value={questionForm.option1}
                        onChange={handleQuestionChange}
                        required
                      />
                    </div>
                    <div className="form-input">
                      <label htmlFor="option2">Option 2</label>
                      <input
                        id="option2"
                        name="option2"
                        value={questionForm.option2}
                        onChange={handleQuestionChange}
                        required
                      />
                    </div>
                    <div className="form-input">
                      <label htmlFor="option3">Option 3</label>
                      <input
                        id="option3"
                        name="option3"
                        value={questionForm.option3}
                        onChange={handleQuestionChange}
                        required
                      />
                    </div>
                    <div className="form-input">
                      <label htmlFor="option4">Option 4</label>
                      <input
                        id="option4"
                        name="option4"
                        value={questionForm.option4}
                        onChange={handleQuestionChange}
                        required
                      />
                    </div>
                    <div className="form-input">
                      <label htmlFor="correctOption">Correct Option</label>
                      <select
                        id="correctOption"
                        name="correctOption"
                        value={questionForm.correctOption}
                        onChange={handleQuestionChange}
                      >
                        {[1, 2, 3, 4].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-actions">
                      <button className="button button-primary" type="submit">
                        Add Question
                      </button>
                    </div>
                  </form>
                </div>
                </div>

              <div className="table-section" style={{ marginTop: '2rem' }}>
                <h3 className="section-title">Existing Quizzes</h3>
                {quizzes.length === 0 ? (
                  <div className="empty-state">No quizzes created yet.</div>
                ) : (
                  <div className="quiz-grid">
                    {quizzes.map((quiz) => (
                      <div key={quiz.quizId} className="quiz-card">
                        <div>
                          <h3>{quiz.title}</h3>
                          <div className="quiz-meta">
                            <span>{quiz.totalQuestions} questions</span>
                            <span className="badge">{quiz.type}</span>
                          </div>
                        </div>
                        <div className="actions-cell">
                          <button
                            className="button button-secondary button-small"
                            onClick={() => handleEditQuiz(quiz)}
                          >
                            Edit
                          </button>
                          <button
                            className="button button-danger button-small"
                            onClick={() => handleDeleteQuiz(quiz.quizId)}
                          >
                            Delete
                          </button>
                          <button
                            className="button button-primary button-small"
                            onClick={() => loadQuizQuestions(quiz.quizId)}
                          >
                            View Questions
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                {quizQuestions.length > 0 && (
                  <div className="table-section" style={{ marginTop: '2rem' }}>
                    <h3 className="section-title">Quiz Questions</h3>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Correct</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizQuestions.map((question) => (
                          <tr key={question.questionId}>
                            <td>{question.questionText}</td>
                            <td>Option {question.correctOption}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </AnimatedPage>
          )}

          {activeTab === 'courses' && (
            <AnimatedPage>
              <CourseManager onNotify={showToast} />
            </AnimatedPage>
          )}

          {activeTab === 'attendance' && (
            <AnimatedPage>
              <div className="students-view">
                <Attendance role="ADMIN" onNotify={showToast} />
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

          {activeTab === 'analytics' && (
            <AnimatedPage>
              <div className="analytics-view">
                <h2 className="page-title">📊 Analytics</h2>
                <div className="analytics-container">
                  <div className="analytics-card">
                    <h3>Total Students</h3>
                    <p className="big-number">{students.length}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Unique Roles</h3>
                    <p className="big-number">
                      {new Set(students.map((student) => student.role).filter(Boolean)).size || 1}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedPage>
          )}
        </div>
      </div>

      <StudentForm
        onSubmit={handleAddStudent}
        editingStudent={null}
        onCancel={handleCancelForm}
        isOpen={isFormOpen}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
};

export default AdminDashboard;
