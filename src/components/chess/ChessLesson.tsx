import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { LessonInfo } from './LessonInfo';
import type { ChessLesson, Position, ChessPiece } from './types/chess';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';

interface ChessLessonProps {
  lesson: ChessLesson;
  onComplete: () => void;
}

export function ChessLesson({ lesson, onComplete }: ChessLessonProps) {
  const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
  const [pieces, setPieces] = useState<ChessPiece[]>([]);
  
  const user = useAuthStore(state => state.user);
  const completeLesson = useProgressStore(state => state.completeLesson);

  useEffect(() => {
    // Reset pieces when lesson changes, now using black pieces
    setPieces([
      { type: lesson.piece, color: 'black', position: lesson.initialPosition }
    ]);
    setSelectedPiece(null);
  }, [lesson]);

  const handleSquareClick = async (position: Position) => {
    const piece = pieces.find(p => 
      p.position.x === position.x && p.position.y === position.y
    );

    if (piece) {
      setSelectedPiece(piece);
      return;
    }

    if (selectedPiece) {
      const isValidMove = lesson.validMoves.some(move => 
        move.x === position.x && move.y === position.y
      );

      if (isValidMove) {
        const newPieces = pieces.map(p => 
          p === selectedPiece 
            ? { ...p, position } 
            : p
        );
        setPieces(newPieces);
        
        if (user) {
          await completeLesson(user.id, lesson.id);
        }
        onComplete();
      }

      setSelectedPiece(null);
    }
  };

  const highlightedSquares = selectedPiece ? lesson.validMoves : [];

  return (
    <div className="space-y-6">
      <LessonInfo lesson={lesson} />
      <ChessBoard
        pieces={pieces}
        highlightedSquares={highlightedSquares}
        onSquareClick={handleSquareClick}
      />
      <div className="text-center text-gray-300 text-sm">
        Click the piece to see valid moves, then click a highlighted square to move
      </div>
    </div>
  );
}