import React from 'react';
import type { ChessLesson } from './types/chess';

interface LessonInfoProps {
  lesson: ChessLesson;
}

export function LessonInfo({ lesson }: LessonInfoProps) {
  return (
    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-2 text-white">{lesson.title}</h3>
      <p className="text-gray-200">{lesson.description}</p>
    </div>
  );
}