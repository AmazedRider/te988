import React, { useState } from 'react';
import { ChessLesson } from './ChessLesson';
import { chessLessons } from '../../data/chessLessons';
import { Trophy } from 'lucide-react';

export function ChessLearning({ onClose }: { onClose: () => void }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set<number>());

  const handleLessonComplete = () => {
    setCompletedLessons(prev => new Set(prev).add(currentLessonIndex));
    if (currentLessonIndex < chessLessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const currentLesson = chessLessons[currentLessonIndex];
  const isAllComplete = completedLessons.size === chessLessons.length;

  if (isAllComplete) {
    return (
      <div className="text-center py-12 text-white">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
        <p className="text-gray-200">You've completed all chess lessons!</p>
        <div className="space-x-4 mt-4">
          <button
            onClick={() => {
              setCompletedLessons(new Set());
              setCurrentLessonIndex(0);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
          >
            Start Over
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center text-white">
          <h2 className="text-2xl font-bold">Chess Lessons</h2>
          <span>
            {completedLessons.size}/{chessLessons.length} Complete
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${(completedLessons.size / chessLessons.length) * 100}%`
            }}
          />
        </div>
      </div>
      
      <ChessLesson
        lesson={currentLesson}
        onComplete={handleLessonComplete}
      />
    </div>
  );
}