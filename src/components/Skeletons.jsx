import React from 'react';

const SkeletonBlock = ({ className = '' }) => (
  <div className={'animate-pulse rounded-md bg-slate-200/80 ' + className} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={'rounded-2xl border border-slate-200 bg-white p-4 shadow ' + className}>
    <div className="flex items-center gap-4">
      <SkeletonBlock className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonStats = () => (
  <div className="statistics-cards">
    {[0, 1, 2, 3].map((item) => (
      <div key={item} className="stat-card">
        <SkeletonBlock className="h-12 w-12 rounded-full" />
        <div className="stat-content">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="mt-2 h-4 w-24" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="table-wrapper">
    <table className="modern-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <SkeletonBlock className="h-4 w-20 bg-white/70" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((__, colIndex) => (
              <td key={colIndex}>
                <SkeletonBlock className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonQuiz = () => (
  <div className="mx-auto w-full max-w-5xl px-4">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-7 w-56" />
      </div>
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-10 w-24 rounded-full" />
        <SkeletonBlock className="h-10 w-24 rounded-full" />
        <SkeletonBlock className="h-12 w-12 rounded-full" />
      </div>
    </div>

    <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-200/70" />

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-6 space-y-4">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-7 w-3/4" />
        <SkeletonBlock className="h-40 w-full rounded-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border-2 border-slate-200 p-4">
            <SkeletonBlock className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonAttendance = () => (
  <div className="table-section">
    <div className="mb-6 space-y-2">
      <SkeletonBlock className="h-6 w-48" />
      <SkeletonBlock className="h-4 w-64" />
    </div>
    <div className="mb-6 flex flex-wrap gap-3">
      <SkeletonBlock className="h-10 w-40 rounded-full" />
      <SkeletonBlock className="h-10 w-32 rounded-full" />
      <SkeletonBlock className="h-10 w-28 rounded-full" />
    </div>
    <SkeletonTable rows={4} columns={4} />
  </div>
);

export const SkeletonDashboard = () => (
  <div className="students-view">
    <SkeletonStats />
    <div className="mt-6">
      <SkeletonTable rows={5} columns={4} />
    </div>
  </div>
);

export default SkeletonBlock;
