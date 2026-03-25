import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import AnimatedPage from './AnimatedPage';
import { SkeletonAttendance } from './Skeletons';

const Attendance = ({ role, studentId, onNotify }) => {
  const [report, setReport] = useState([]);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [confirmStatus, setConfirmStatus] = useState(null);

  const notify = (message, type = 'success') => {
    if (onNotify) onNotify(message, type);
  };

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        if (role === 'ADMIN') {
          const [reportRes, studentsRes] = await Promise.all([
            api.get('/api/attendance/report'),
            api.get('/api/students')
          ]);
          setReport(Array.isArray(reportRes.data) ? reportRes.data : []);
          setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        } else if (studentId) {
          const response = await api.get(`/api/attendance/student/${studentId}`);
          setRecords(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        setReport([]);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [role, studentId]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((item) => item.date === todayKey);
  const alreadyMarkedToday = Boolean(todayRecord);
  const canMark = role === 'ADMIN';
  const hasToken = Boolean(localStorage.getItem('smp_token'));

  const markAttendance = async (status) => {
    const targetStudentId = role === 'ADMIN' ? selectedStudentId : studentId;
    if (!targetStudentId) return;
    if (!canMark) {
      notify('Only admins can mark attendance.', 'warning');
      return;
    }
    if (!hasToken) {
      notify('Please log in as admin to mark attendance.', 'warning');
      return;
    }
    if (alreadyMarkedToday) {
      notify('Attendance already marked for today.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post('/api/attendance', {
        studentId: Number(targetStudentId),
        status
      });
      setRecords((prev) => [response.data, ...prev]);
      notify(`Marked ${status.toLowerCase()} successfully!`);
    } catch {
      notify('Failed to mark attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const monthSummary = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const monthIndex = calendarMonth.getMonth();
    const filtered = records.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === year && itemDate.getMonth() === monthIndex;
    });
    const total = filtered.length;
    const present = filtered.filter((item) => item.status === 'PRESENT').length;
    const percent = total ? ((present / total) * 100).toFixed(1) : '0.0';
    return { total, present, percent };
  }, [records, calendarMonth]);

  const exportAttendance = () => {
    if (records.length === 0) {
      notify('No attendance data to export.', 'warning');
      return;
    }
    const data = records.map((item) => ({
      Date: item.date,
      Status: item.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const fileName = `Attendance_${studentId || 'student'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <AnimatedPage>
        <SkeletonAttendance />
      </AnimatedPage>
    );
  }

  if (role === 'ADMIN') {
    return (
      <AnimatedPage>
        <div className="table-section">
          <h2 className="page-title">📅 Attendance Overview</h2>
          <div className="page-header">
            <div className="actions-cell">
              <select
                className="sort-select"
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <button
                className="button button-primary"
                onClick={() => setConfirmStatus('PRESENT')}
                disabled={submitting || !selectedStudentId}
              >
                Mark Present
              </button>
              <button
                className="button button-secondary"
                onClick={() => setConfirmStatus('ABSENT')}
                disabled={submitting || !selectedStudentId}
              >
                Mark Absent
              </button>
              <button className="button button-secondary" onClick={exportAttendance}>
                Export Excel
              </button>
            </div>
          </div>
          {report.length === 0 ? (
            <div className="empty-state">No attendance records yet.</div>
          ) : (
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Total Days</th>
                    <th>Present Days</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((item) => (
                    <tr key={item.studentId}>
                      <td>{item.studentName}</td>
                      <td>{item.totalDays}</td>
                      <td>{item.presentDays}</td>
                      <td>{item.percentage?.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ConfirmModal
            status={confirmStatus}
            onCancel={() => setConfirmStatus(null)}
            onConfirm={() => {
              markAttendance(confirmStatus);
              setConfirmStatus(null);
            }}
          />
        </div>
      </AnimatedPage>
    );
  }

  if (records.length === 0) {
    return (
      <AnimatedPage>
        <div className="table-section">
          <h2 className="page-title">📅 My Attendance</h2>
          {canMark ? (
            <div className="page-header">
              <div className="actions-cell">
                <button
                  className="button button-primary"
                  onClick={() => setConfirmStatus('PRESENT')}
                  disabled={submitting || alreadyMarkedToday}
                >
                  Mark Present
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => setConfirmStatus('ABSENT')}
                  disabled={submitting || alreadyMarkedToday}
                >
                  Mark Absent
                </button>
                <button className="button button-secondary" onClick={exportAttendance}>
                  Export Excel
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Attendance is managed by admin. Your status will appear here.
            </div>
          )}
          <div className="empty-state">No attendance data available.</div>
          <ConfirmModal
            status={confirmStatus}
            onCancel={() => setConfirmStatus(null)}
            onConfirm={() => {
              markAttendance(confirmStatus);
              setConfirmStatus(null);
            }}
          />
        </div>
      </AnimatedPage>
    );
  }

  const presentCount = records.filter((item) => item.status === 'PRESENT').length;
  const totalCount = records.length;
  const percentage = totalCount ? ((presentCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <AnimatedPage>
      <div className="table-section">
        <h2 className="page-title">📅 My Attendance</h2>
      {canMark ? (
        <div className="page-header">
          <div className="actions-cell">
            <button
              className="button button-primary"
              onClick={() => setConfirmStatus('PRESENT')}
              disabled={submitting || alreadyMarkedToday}
            >
              Mark Present
            </button>
            <button
              className="button button-secondary"
              onClick={() => setConfirmStatus('ABSENT')}
              disabled={submitting || alreadyMarkedToday}
            >
              Mark Absent
            </button>
            <button className="button button-secondary" onClick={exportAttendance}>
              Export Excel
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          Attendance is managed by admin. Your status will appear here.
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
          Today: {todayRecord ? todayRecord.status : 'Not marked'}
        </div>
        <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          This Month: {monthSummary.present}/{monthSummary.total} ({monthSummary.percent}%)
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Present: {presentCount}
        </div>
        <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          Total: {totalCount}
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Attendance: {percentage}%
        </div>
      </div>
      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-section" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-title">Attendance Calendar</h3>
        <CalendarView
          records={records}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      </div>
        <ConfirmModal
          status={confirmStatus}
          onCancel={() => setConfirmStatus(null)}
          onConfirm={() => {
            markAttendance(confirmStatus);
            setConfirmStatus(null);
          }}
        />
      </div>
    </AnimatedPage>
  );
};

export default Attendance;

const CalendarView = ({ records, month, onMonthChange }) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const recordMap = new Map(records.map((item) => [item.date, item.status]));
  const weeks = [];
  let current = 1 - startWeekday;
  while (current <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      if (current < 1 || current > daysInMonth) {
        week.push(null);
      } else {
        const dateKey = new Date(year, monthIndex, current).toISOString().slice(0, 10);
        week.push({
          day: current,
          status: recordMap.get(dateKey) || null
        });
      }
      current += 1;
    }
    weeks.push(week);
  }

  const changeMonth = (offset) => {
    const next = new Date(year, monthIndex + offset, 1);
    onMonthChange(next);
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="button button-secondary button-small" onClick={() => changeMonth(-1)}>
          Prev
        </button>
        <div className="calendar-title">
          {month.toLocaleString('default', { month: 'long' })} {year}
        </div>
        <button className="button button-secondary button-small" onClick={() => changeMonth(1)}>
          Next
        </button>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <div key={label} className="calendar-cell calendar-label">
            {label}
          </div>
        ))}
        {weeks.flat().map((item, index) => (
          <div key={index} className="calendar-cell">
            {item ? (
              <div className={`calendar-day ${item.status ? item.status.toLowerCase() : ''}`}>
                <span>{item.day}</span>
              </div>
            ) : (
              <span className="calendar-empty">—</span>
            )}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <span className="legend present">Present</span>
        <span className="legend absent">Absent</span>
        <span className="legend none">No record</span>
      </div>
    </div>
  );
};

const ConfirmModal = ({ status, onCancel, onConfirm }) => {
  if (!status) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>Confirm Attendance</h3>
        <p>Mark yourself as <strong>{status}</strong> for today?</p>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
