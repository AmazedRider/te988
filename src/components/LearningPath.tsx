import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';
import { useThemeStore } from '../stores/themeStore';
import { lessons } from '../data/lessons';
import { LessonCard } from './lessons/LessonCard';
import { BasicMoves } from './chess/BasicMoves';
import { BasicTactics } from './tactics/BasicTactics';
import { EndgameEssentials } from './endgame/EndgameEssentials';
import { ChessModal } from './chess/ChessModal';
import { GraduationCap } from 'lucide-react';

export function LearningPath() {
  const [showBasicMoves, setShowBasicMoves] = useState(false);
  const [showBasicTactics, setShowBasicTactics] = useState(false);
  const [showEndgame, setShowEndgame] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const { fetchProgress, lessonProgress, loading } = useProgressStore();
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    if (user) {
      fetchProgress(user.id);
    }
  }, [user, fetchProgress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg text-white/80 animate-pulse">Loading your learning path...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/20 rounded-xl shadow-inner">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Your Learning Path
          </h2>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Master chess with structured lessons and practice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((lesson) => (
          <LessonCard 
            key={lesson.id} 
            {...lesson} 
            completed={lessonProgress.get(lesson.id) || false}
            onStartBasicMoves={() => setShowBasicMoves(true)}
            onStartBasicTactics={() => setShowBasicTactics(true)}
            onStartEndgame={() => setShowEndgame(true)}
          />
        ))}
      </div>

      {showBasicMoves && (
        <ChessModal onClose={() => setShowBasicMoves(false)}>
          <BasicMoves 
            onClose={() => setShowBasicMoves(false)} 
            onComplete={() => {
              if (user) {
                useProgressStore.getState().completeLesson(user.id, 1);
              }
              setShowBasicMoves(false);
            }}
          />
        </ChessModal>
      )}

      {showBasicTactics && (
        <ChessModal onClose={() => setShowBasicTactics(false)}>
          <BasicTactics 
            onClose={() => setShowBasicTactics(false)}
            onComplete={() => {
              if (user) {
                useProgressStore.getState().completeLesson(user.id, 3);
              }
              setShowBasicTactics(false);
            }}
          />
        </ChessModal>
      )}

      {showEndgame && (
        <ChessModal onClose={() => setShowEndgame(false)}>
          <EndgameEssentials 
            onClose={() => {
              setShowEndgame(false);
            }}
            onComplete={() => {
              if (user) {
                useProgressStore.getState().completeLesson(user.id, 4);
                toast.success('Endgame Essentials completed!');
              }
              setShowEndgame(false);
            }}
          />
        </ChessModal>
      )}
    </div>
  );
}