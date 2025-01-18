import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import type { ChessOpening } from './types/opening';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { chessOpenings } from '../../data/openings';

interface OpeningLessonProps {
  opening: ChessOpening;
  onComplete: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function OpeningLesson({ opening, onComplete, onBack, onNext }: OpeningLessonProps) {
  const [game, setGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const completeLesson = useProgressStore(state => state.completeLesson);

  useEffect(() => {
    resetLesson();
  }, [opening]);

  const resetLesson = () => {
    setGame(new Chess());
    setCurrentMoveIndex(0);
    setIsCompleted(false);
    setShowCompletionPrompt(false);
  };

  const getHighlightedSquares = () => {
    if (currentMoveIndex >= opening.moves.length) return {};

    const nextMove = opening.moves[currentMoveIndex];
    const fromSquare = nextMove.slice(0, 2);
    const toSquare = nextMove.slice(2, 4);

    return {
      [fromSquare]: {
        background: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '0',
      },
      [toSquare]: {
        background: 'rgba(0, 255, 0, 0.4)',
        borderRadius: '0',
      },
    };
  };

  const handleMove = (from: string, to: string) => {
    const expectedMove = opening.moves[currentMoveIndex];
    if (expectedMove === from + to) {
      const newGame = new Chess(game.fen());
      const result = newGame.move({ from, to });
      
      if (!result) return false;
      
      setGame(newGame);
      
      // Make black's move automatically after a delay
      setTimeout(() => {
        const blackMove = opening.moves[currentMoveIndex + 1];
        if (blackMove) {
          const newGameAfterBlack = new Chess(newGame.fen());
          newGameAfterBlack.move({
            from: blackMove.slice(0, 2),
            to: blackMove.slice(2, 4)
          });
          setGame(newGameAfterBlack);
          setCurrentMoveIndex(prev => prev + 2);
        }
      }, 500);

      // Check if opening is complete
      if (currentMoveIndex >= opening.moves.length - 2) {
        setIsCompleted(true);
        setShowCompletionPrompt(true);
        onComplete();
      }
      return true;
    }
    return false;
  };

  const currentOpeningIndex = chessOpenings.findIndex(o => o.id === opening.id);
  const isLastOpening = currentOpeningIndex === chessOpenings.length - 1;

  if (showCompletionPrompt) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center space-y-6 py-12">
          <h3 className="text-2xl font-bold text-white">
            Congratulations! 🎉
          </h3>
          <p className="text-xl text-gray-200">
            You've mastered the {opening.name}!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              Back to Openings
            </button>
            {!isLastOpening && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Next Opening
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Openings
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={resetLesson}
              className="flex items-center gap-2 text-white hover:text-primary"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Position
            </button>
          </div>
        </div>
        
        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-2 text-white">{opening.name}</h3>
          <p className="text-gray-200">{opening.description}</p>
          <div className="mt-2 text-gray-300 text-sm">
            Progress: Move {Math.floor(currentMoveIndex / 2) + 1} of {Math.floor(opening.moves.length / 2)}
          </div>
        </div>
      </div>

      <div className="aspect-square max-w-2xl mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handleMove}
          customSquareStyles={getHighlightedSquares()}
          boardOrientation="white"
          areArrowsAllowed={true}
        />
      </div>

      <div className="mt-4 text-center text-gray-300 text-sm">
        {isCompleted 
          ? "Opening completed! Great job!"
          : "Move the highlighted piece to the green square"
        }
      </div>
    </div>
  );
}