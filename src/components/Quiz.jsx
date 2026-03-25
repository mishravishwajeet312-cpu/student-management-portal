import React, { useEffect, useRef, useState } from 'react';
import quizData from '../data/quiz';
import startSound from '../audio/start.mp3';
import rightSound from '../audio/right.mp3';
import wrongSound from '../audio/wrong.mp3';
import winSound from '../audio/win.mp3';
import timerSound from '../audio/timer.mp3';
import AnimatedPage from './AnimatedPage';
import { SkeletonQuiz } from './Skeletons';

const DEFAULT_TIMER_SECONDS = 30;
const PASS_MARK = 7;
const UNLOCK_KEY = 'quiz_unlocked_level';
const HISTORY_KEY = 'quiz_history';

const shuffle = (items = []) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const buildQuestionsForLevel = (level, data) => {
  const pool = data.filter((item) => Number(item.level) === level);
  const selected = shuffle(pool).slice(0, 10);
  return selected.map((item, index) => {
    const options = shuffle(item.options || []);
    const correctIndex = options.indexOf(item.answer) + 1;
    return {
      id: `${level}-${index}`,
      level,
      question: item.question,
      options,
      correctIndex,
      image: item.image || null,
      sound: item.sound || null
    };
  });
};

const Quiz = ({ timerSeconds = DEFAULT_TIMER_SECONDS }) => {
  const [quizList] = useState([
    { level: 1, title: 'Level 1' },
    { level: 2, title: 'Level 2' },
    { level: 3, title: 'Level 3' }
  ]);
  const [questions, setQuestions] = useState([]);
  const [levelIndex, setLevelIndex] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isLocked, setIsLocked] = useState(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    const stored = Number(localStorage.getItem(UNLOCK_KEY));
    return stored && stored > 0 ? stored : 1;
  });
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const rightAudio = useRef(null);
  const startAudio = useRef(null);
  const wrongAudio = useRef(null);
  const winAudio = useRef(null);
  const timerAudio = useRef(null);
  const tickRef = useRef(null);

  const currentLevel = levelIndex !== null ? quizList[levelIndex] : null;
  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length || 0;
  const progressPercent =
    totalQuestions > 0 ? Math.round(((questionIndex + 1) / totalQuestions) * 100) : 0;

  useEffect(() => {
    startAudio.current = new Audio(startSound);
    rightAudio.current = new Audio(rightSound);
    wrongAudio.current = new Audio(wrongSound);
    winAudio.current = new Audio(winSound);
    timerAudio.current = new Audio(timerSound);
    if (timerAudio.current) {
      timerAudio.current.loop = true;
    }
    const stopAll = () => {
      clearInterval(tickRef.current);
      if (timerAudio.current) {
        timerAudio.current.pause();
        timerAudio.current.currentTime = 0;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stopAll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopAll();
    };
  }, []);

  useEffect(() => {
    if (!currentQuestion || showResult) return;

    setTimeLeft(timerSeconds);
    setIsLocked(false);
    setSelectedOption(null);

    if (timerAudio.current) {
      timerAudio.current.currentTime = 0;
      timerAudio.current.play().catch(() => {});
    }

    tickRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(tickRef.current);
      if (timerAudio.current) {
        timerAudio.current.pause();
      }
    };
  }, [currentQuestion, showResult, timerSeconds]);

  useEffect(() => {
    if (!showQuitModal) return;
    clearInterval(tickRef.current);
    if (timerAudio.current) {
      timerAudio.current.pause();
      timerAudio.current.currentTime = 0;
    }
  }, [showQuitModal]);

  useEffect(() => {
    if (levelIndex !== null) return;
    clearInterval(tickRef.current);
    if (timerAudio.current) {
      timerAudio.current.pause();
      timerAudio.current.currentTime = 0;
    }
  }, [levelIndex]);

  useEffect(() => {
    if (showResult) return;
    if (timeLeft > 0) return;
    handleTimeout();
  }, [timeLeft, showResult]);

  const playSound = (audioRef) => {
    if (!audioRef?.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const startLevel = (index) => {
    clearInterval(tickRef.current);
    if (timerAudio.current) timerAudio.current.pause();
    playSound(startAudio);

    setIsQuestionLoading(true);
    setLevelIndex(index);
    setQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsLocked(false);
    setTimeLeft(timerSeconds);

    const level = quizList[index];
    setQuestions(buildQuestionsForLevel(level.level, quizData));
    setTimeout(() => {
      setIsQuestionLoading(false);
    }, 200);
  };

  const exitToLevels = () => {
    clearInterval(tickRef.current);
    if (timerAudio.current) timerAudio.current.pause();
    setShowQuitModal(false);
    setIsQuestionLoading(false);
    setLevelIndex(null);
    setQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsLocked(false);
    setTimeLeft(timerSeconds);
  };

  const handleTimeout = () => {
    if (isLocked) return;
    setIsLocked(true);
    playSound(wrongAudio);
    setTimeout(() => {
      goToNext();
    }, 600);
  };

  const handleOptionClick = (optionIndex) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
      playSound(rightAudio);
    } else {
      playSound(wrongAudio);
    }
    setTimeout(() => {
      goToNext();
    }, 650);
  };

  const goToNext = () => {
    clearInterval(tickRef.current);
    if (timerAudio.current) timerAudio.current.pause();

    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }

    setShowResult(true);
    if (currentLevel?.level === quizList.length) {
      playSound(winAudio);
    }
  };

  const persistHistory = (entry) => {
    const next = [entry, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const finalizeLevel = () => {
    const passed = score >= PASS_MARK;
    const nextUnlocked = passed ? Math.min(unlockedLevel + 1, quizList.length) : unlockedLevel;
    if (nextUnlocked !== unlockedLevel) {
      setUnlockedLevel(nextUnlocked);
      localStorage.setItem(UNLOCK_KEY, String(nextUnlocked));
    }
    persistHistory({
      id: `${Date.now()}-${currentLevel?.level}`,
      level: currentLevel?.level,
      score,
      total: totalQuestions,
      passed,
      date: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (showResult && currentLevel) {
      finalizeLevel();
    }
  }, [showResult]);

  const restartLevel = () => {
    startLevel(levelIndex ?? 0);
  };

  if (levelIndex === null) {
    return (
      <AnimatedPage>
        <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-500">
              Level Select
            </p>
            <h2 className="text-2xl font-bold text-slate-800">Kids Quiz Adventure</h2>
          </div>
          <div className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-600">
            Unlocked: Level {unlockedLevel}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {quizList.map((level, index) => {
              const locked = level.level > unlockedLevel;
              return (
                <button
                  key={level.level}
                  onClick={() => startLevel(index)}
                  disabled={locked}
                  className={`rounded-3xl border p-6 text-left shadow transition ${
                    locked
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                      : 'border-sky-100 bg-white hover:-translate-y-1 hover:border-sky-300'
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-widest text-sky-500">
                    Level {level.level}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{level.title}</h3>
                  <p className="mt-3 text-sm">
                    Pass {PASS_MARK} questions to unlock the next level.
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-slate-800">Recent Attempts</h3>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No attempts yet. Start a level!</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {history.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-700">Level {item.level}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.passed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {item.score}/{item.total}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!currentQuestion) {
    return (
      <AnimatedPage>
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800">No quiz data available.</h2>
        </div>
      </AnimatedPage>
    );
  }

  if (isQuestionLoading) {
    return (
      <AnimatedPage>
        <SkeletonQuiz />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mx-auto w-full max-w-5xl px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-500">
            Level {currentLevel?.level}
          </p>
          <h2 className="text-2xl font-bold text-slate-800">Kids Quiz Challenge</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowQuitModal(true)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
          >
            Quit
          </button>
          <div className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-600">
            Score: {score}
          </div>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
              timeLeft <= 5 ? 'border-red-400 text-red-500' : 'border-sky-300 text-sky-600'
            } font-bold`}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl">
        <div className="mb-6 flex flex-col gap-4">
          <p className="text-lg font-semibold text-slate-700">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
          <h3 className="text-2xl font-bold text-slate-800">{currentQuestion.question}</h3>
          {currentQuestion.image && (
            <img
              src={currentQuestion.image}
              alt="Question media"
              className="max-h-64 w-full rounded-2xl object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
          {currentQuestion.sound && <AudioPrompt src={currentQuestion.sound} />}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index + 1;
            const isCorrect = isLocked && index + 1 === currentQuestion.correctIndex;
            const isWrong = isLocked && isSelected && index + 1 !== currentQuestion.correctIndex;

            return (
              <button
                key={`${option}-${index}`}
                onClick={() => handleOptionClick(index + 1)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : isWrong
                    ? 'border-red-400 bg-red-50 text-red-600'
                  : isSelected
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                }`}
                disabled={isLocked}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showResult && (
        <div className="mt-6 rounded-3xl bg-gradient-to-r from-sky-400 to-emerald-400 p-6 text-white shadow-xl">
          <h3 className="text-2xl font-bold">Great Job!</h3>
          <p className="mt-2 text-lg">
            Final Score: {score} / {totalQuestions}
          </p>
          <p className="mt-2 text-sm">
            {score >= PASS_MARK
              ? 'Great job! Next level unlocked.'
              : `Score ${PASS_MARK} to unlock the next level.`}
          </p>
          <button
            onClick={restartLevel}
            className="mt-4 rounded-full bg-white px-6 py-2 font-semibold text-sky-600 shadow"
          >
            Retry Level
          </button>
          <button
            onClick={exitToLevels}
            className="mt-4 ml-3 rounded-full border border-white/40 px-6 py-2 font-semibold text-white"
          >
            Back to Levels
          </button>
        </div>
      )}

      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800">Exit Quiz?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your current progress will be lost. Are you sure you want to quit this level?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Stay
              </button>
              <button
                onClick={exitToLevels}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AnimatedPage>
  );
};

export default Quiz;

const AudioPrompt = ({ src }) => {
  const audioRef = useRef(null);
  const [error, setError] = useState(false);

  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
      <p className="text-sm font-semibold text-sky-600">Audio Question</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
          onClick={handlePlay}
        >
          Play Sound
        </button>
        <audio ref={audioRef} src={src} preload="none" onError={() => setError(true)} />
        {error && (
          <span className="text-xs text-red-500">
            Audio failed to load. Please try again later.
          </span>
        )}
      </div>
    </div>
  );
};
