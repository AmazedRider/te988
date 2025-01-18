import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TacticLesson } from './TacticLesson';
import { chessTactics } from '../../data/chessTactics';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';

interface BasicTacticsProps {
  onClose: () => void;
  onComplete: () => void;
}

export function BasicTactics({ onClose, onComplete }: BasicTacticsProps) {
  const [currentTacticIndex, setCurrentTacticIndex] = useState(0);
  const [completedTactics, setCompletedTactics] = useState(new Set<number>());
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const completeLesson = useProgressStore(state => state.completeLesson);

  const handleTacticComplete = async () => {
    setCompletedTactics(prev => new Set(prev).add(currentTacticIndex));
    
    // Save progress for this tactic
    if (user) {
      await completeLesson(user.id, 3);
    }
    
    if (currentTacticIndex < chessTactics.length - 1) {
      setShowNextPrompt(true);
    } else {
      onComplete();
      onClose();
    }
  };

  const handleNext = () => {
    setCurrentTacticIndex(prev => prev + 1);
    setShowNextPrompt(false);
  };

  const currentTactic = chessTactics[currentTacticIndex];
  const isLastTactic = currentTacticIndex === chessTactics.length - 1;

  return (
    <div className="h-screen max-w-7xl mx-auto px-4 flex flex-col">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <span className="text-white">
            {completedTactics.size}/{chessTactics.length} Complete
          </span>
        </div>
        
        <div className="h-2 bg-gray-700 rounded-full mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${(completedTactics.size / chessTactics.length) * 100}%`
            }}
          />
        </div>
      </div>

      {showNextPrompt ? (
        <div className="text-center space-y-4 py-8">
          <h3 className="text-2xl font-bold text-white">Great job!</h3>
          <p className="text-gray-200">You've mastered the {currentTactic.name.toLowerCase()} tactic.</p>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg mx-auto hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Next Tactic
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <TacticLesson
          tactic={currentTactic}
          onComplete={handleTacticComplete}
        />
      )}

      <div className="mt-4 text-center text-gray-400">
        {isLastTactic ? 
          'This is the final tactic!' : 
          `${chessTactics.length - currentTacticIndex - 1} tactics remaining`
        }
      </div>
    </div>
  );
}