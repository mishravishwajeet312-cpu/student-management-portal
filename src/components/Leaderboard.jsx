import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AnimatedPage from './AnimatedPage';
import { SkeletonTable } from './Skeletons';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const scoresResponse = await api.get('/api/leaderboard');
        const data = Array.isArray(scoresResponse.data) ? scoresResponse.data : [];
        const sorted = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));
        setScores(sorted);
      } catch {
        setScores([]);
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, []);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="table-section">
          <div className="page-header">
            <h2 className="page-title">🏆 Global Leaderboard</h2>
          </div>
          <SkeletonTable rows={6} columns={5} />
        </div>
      </AnimatedPage>
    );
  }

  if (scores.length === 0) {
    return (
      <AnimatedPage>
        <div className="table-section">
          <p className="empty-state">No scores yet. Be the first to play!</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="table-section">
        <div className="page-header">
          <h2 className="page-title">🏆 Global Leaderboard</h2>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Score</th>
                <th>Level/Quiz</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((item, index) => {
                const rank = index + 1;
                const highlight =
                  rank === 1
                    ? 'bg-yellow-50'
                    : rank === 2
                    ? 'bg-slate-50'
                    : rank === 3
                    ? 'bg-orange-50'
                    : '';
                return (
                  <tr key={item.id || `${item.studentName}-${index}`} className={highlight}>
                    <td>{rank}</td>
                    <td>{item.studentName || `Student ${item.studentId || ''}`}</td>
                    <td>{item.score}</td>
                    <td>{item.quizId || '—'}</td>
                    <td>{item.dateTaken ? new Date(item.dateTaken).toLocaleString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Leaderboard;
