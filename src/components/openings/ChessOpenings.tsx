import React, { useState } from 'react';
import { OpeningsSelection } from './OpeningsSelection';
import { OpeningLesson } from './OpeningLesson';
import type { ChessOpening } from './types/opening';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';
import { chessOpenings } from '../../data/openings';

export function ChessOpenings({ onClose }: { onClose: () => void }) {
  const [selectedOpening, setSelectedOpening] = useState<ChessOpening | null>(null);
  const lessonProgress = useProgressStore(state => state.lessonProgress);
  const completeLesson = useProgressStore(state => state.completeLesson);
  const user = useAuthStore(state => state.user);
  
  const completedOpenings = new Set(
    Array.from(lessonProgress.entries())
      .filter(([_, completed]) => completed)
      .map(([id]) => id.toString())
  );

  const handleComplete = async () => {
    if (!user) return;

    const currentOpeningId = parseInt(selectedOpening?.id || '0');
    try {
      // First, complete the current opening
      await completeLesson(user.id, 2);

      // Check if all openings are completed
      const allOpeningsCompleted = chessOpenings.every(opening => 
        completedOpenings.has(opening.id) || parseInt(opening.id) === currentOpeningId
      );
      
      if (allOpeningsCompleted) {
        // Ensure the lesson is marked as completed
        await completeLesson(user.id, 2);
        setTimeout(onClose, 1000); // Return to dashboard after a short delay
      }
    } catch (error) {
      console.error('Error completing opening:', error);
    }
  };

  const handleNext = () => {
    const currentIndex = chessOpenings.findIndex(o => o.id === selectedOpening?.id);
    if (currentIndex < chessOpenings.length - 1) {
      setSelectedOpening(chessOpenings[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900/95">
      {selectedOpening ? (
        <OpeningLesson
          opening={selectedOpening}
          onComplete={handleComplete}
          onBack={() => setSelectedOpening(null)}
          onNext={handleNext}
        />
      ) : (
        <OpeningsSelection
          onSelectOpening={setSelectedOpening}
          completedOpenings={completedOpenings}
        />
      )}
    </div>
  );
}