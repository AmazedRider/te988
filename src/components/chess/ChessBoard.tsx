import React from 'react';
import { Square } from './Square';
import type { Position, ChessPiece } from './types/chess';

interface ChessBoardProps {
  pieces: ChessPiece[];
  highlightedSquares: Position[];
  onSquareClick: (position: Position) => void;
  getSquareHighlight?: (position: Position) => 'move' | 'capture' | undefined;
}

export function ChessBoard({ 
  pieces, 
  highlightedSquares,
  onSquareClick,
  getSquareHighlight
}: ChessBoardProps) {
  const boardSize = 8;
  
  const isHighlighted = (pos: Position) => 
    highlightedSquares.some(h => h.x === pos.x && h.y === pos.y);

  const getPiece = (pos: Position) =>
    pieces.find(p => p.position.x === pos.x && p.position.y === pos.y);

  return (
    <div className="relative">
      <div className="grid grid-cols-8 gap-0 border-4 border-amber-900 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        {Array.from({ length: boardSize }, (_, y) =>
          Array.from({ length: boardSize }, (_, x) => {
            const position = { x, y };
            const isLight = (x + y) % 2 === 0;
            
            return (
              <Square
                key={`${x}-${y}`}
                position={position}
                piece={getPiece(position)}
                isLight={isLight}
                isHighlighted={isHighlighted(position)}
                highlightType={getSquareHighlight?.(position)}
                onClick={() => onSquareClick(position)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}