import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RotateCcw } from 'lucide-react';
import type { ChessTactic } from './types/tactics';

interface TacticLessonProps {
  tactic: ChessTactic;
  onComplete: () => void;
}

export function TacticLesson({ tactic, onComplete }: TacticLessonProps) {
  const [game, setGame] = useState(new Chess(tactic.initialPosition));
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [message, setMessage] = useState('Find the best move!');
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [moveHint, setMoveHint] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    // Reset game when tactic changes
    setGame(new Chess(tactic.initialPosition));
    setCurrentMoveIndex(0);
    setMessage('Find the best move!');
    setSelectedPiece(null);
    setMoveHint(null);
  }, [tactic]);

  useEffect(() => {
    // Show hint after 5 seconds of inactivity
    const timer = setTimeout(() => {
      if (currentMoveIndex < tactic.solution.length) {
        const move = tactic.solution[currentMoveIndex];
        setMoveHint({
          from: move.slice(0, 2),
          to: move.slice(2, 4)
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentMoveIndex, tactic.solution]);

  const resetPosition = () => {
    setGame(new Chess(tactic.initialPosition));
    setCurrentMoveIndex(0);
    setMessage('Find the best move!');
    setSelectedPiece(null);
    setMoveHint(null);
  };

  const getHighlightedSquares = () => {
    const squares: Record<string, { background: string; borderRadius?: string }> = {};

    if (currentMoveIndex >= tactic.solution.length) return squares;

    const expectedMove = tactic.solution[currentMoveIndex];
    const fromSquare = expectedMove.slice(0, 2);
    const toSquare = expectedMove.slice(2, 4);

    // Always show a subtle highlight for the piece that should move
    squares[fromSquare] = {
      background: moveHint ? 'rgba(255, 255, 0, 0.6)' : 'rgba(255, 255, 0, 0.3)',
      borderRadius: '50%'
    };

    // When a piece is selected, show its valid destination
    if (selectedPiece === fromSquare) {
      squares[toSquare] = {
        background: 'rgba(0, 255, 0, 0.4)',
        borderRadius: '50%'
      };
      // Make the selected piece highlight more prominent
      squares[fromSquare].background = 'rgba(255, 255, 0, 0.6)';
    }

    // If hint is active, show the correct move
    if (moveHint) {
      squares[moveHint.to] = {
        background: 'rgba(0, 255, 0, 0.4)',
        borderRadius: '50%'
      };
    }

    return squares;
  };

  const onSquareClick = (square: string) => {
    const expectedMove = tactic.solution[currentMoveIndex];
    const fromSquare = expectedMove.slice(0, 2);
    
    if (!selectedPiece && square === fromSquare) {
      setSelectedPiece(square);
      setMoveHint(null);
    } else if (selectedPiece) {
      const success = onDrop(selectedPiece, square);
      if (!success) {
        setSelectedPiece(null);
        setMessage('Try again! That\'s not the best move.');
      }
    } else {
      setMessage('Click the highlighted piece first!');
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const expectedMove = tactic.solution[currentMoveIndex];
    const move = sourceSquare + targetSquare;

    try {
      if (move === expectedMove) {
        const gameCopy = new Chess(game.fen());
        const result = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        });

        if (!result) {
          console.error('Invalid move:', sourceSquare, targetSquare);
          return false;
        }

        setGame(gameCopy);
        setSelectedPiece(null);
        setMoveHint(null);
        
        if (currentMoveIndex === tactic.solution.length - 1) {
          setMessage('Excellent! You solved the tactic!');
          setTimeout(onComplete, 1500);
        } else {
          setMessage('Correct! Now find the next move.');
          // Make opponent's move after a delay
          setTimeout(() => {
            const opponentMove = tactic.solution[currentMoveIndex + 1];
            if (opponentMove) {
              gameCopy.move({
                from: opponentMove.slice(0, 2),
                to: opponentMove.slice(2, 4),
                promotion: 'q'
              });
              setGame(gameCopy);
            }
            setCurrentMoveIndex(prev => prev + 2);
          }, 500);
        }
        return true;
      } else {
        setMessage('That\'s not the best move. Try again!');
        return false;
      }
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-white">{tactic.name}</h3>
          <button
            onClick={resetPosition}
            className="flex items-center gap-2 text-white hover:text-primary"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Position
          </button>
        </div>
        <p className="text-gray-200 mb-4">{tactic.description}</p>
        <div className="text-primary font-medium">{message}</div>
      </div>

      <div className="aspect-square max-w-2xl mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={getHighlightedSquares()}
          boardOrientation="white"
          areArrowsAllowed={true}
        />
      </div>

      <div className="text-center text-gray-300 text-sm">
        {moveHint 
          ? "Here's a hint! Make the highlighted move." 
          : "Click the highlighted piece to see where it can move"}
      </div>
    </div>
  );
}