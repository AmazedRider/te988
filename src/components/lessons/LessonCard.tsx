import React, { useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { ChessLearning } from '../chess/ChessLearning';
import { ChessOpenings } from '../openings/ChessOpenings';
import { ChessModal } from '../chess/ChessModal';
import { toast } from 'sonner';

interface LessonCardProps {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  completed: boolean;
  onStartBasicMoves: () => void;
  onStartBasicTactics: () => void;
  onStartEndgame: () => void;
}

export function LessonCard({ 
  id, 
  title, 
  description, 
  icon: Icon, 
  completed,
  onStartBasicMoves,
  onStartBasicTactics,
  onStartEndgame
}: LessonCardProps) {
  const [isLearning, setIsLearning] = useState(false);
  const { user, isGuest } = useAuthStore(state => ({ user: state.user, isGuest: state.isGuest }));
  const completeLesson = useProgressStore(state => state.completeLesson);

  const handleStartLesson = async () => {
    if (isGuest) {
      toast.error(
        <div className="flex flex-col gap-2">
          <p>Please sign in to start lessons</p>
          <button
            onClick={() => useAuthStore.setState({ isGuest: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            Sign in now
          </button>
        </div>
      );
      return;
    }
    
    if (title === "Basic Moves") {
      onStartBasicMoves();
    } else if (title === "Opening Principles") {
      setIsLearning(true);
    } else if (title === "Basic Tactics") {
      onStartBasicTactics();
    } else if (title === "Endgame Essentials") {
      onStartEndgame();
    } else {
      await completeLesson(user!.id, id);
    }
  };

  return (
    <>
      <div className={`chess-card ${completed ? 'bg-green-50' : ''}`}>
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-full ${completed ? 'bg-green-100' : 'bg-accent'}`}>
            <Icon className={`h-6 w-6 ${completed ? 'text-green-600' : 'text-primary'}`} />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
            <button 
              onClick={handleStartLesson}
              disabled={completed}
              className={`btn-primary mt-2 ${
                completed 
                  ? 'bg-green-600 cursor-not-allowed opacity-75' 
                  : 'hover:opacity-90'
              }`}
            >
              {completed ? 'Completed' : 'Start Lesson'}
            </button>
          </div>
        </div>
      </div>

      {isLearning && (
        <ChessModal onClose={() => setIsLearning(false)}>
          {title === "Opening Principles" ? (
            <ChessOpenings onClose={() => setIsLearning(false)} />
          ) : null}
        </ChessModal>
      )}
    </>
  );
}