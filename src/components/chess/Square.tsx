import React from 'react';
import type { ChessPiece, Position } from './types/chess';
import { PieceIcon } from './PieceIcon';

export interface SquareProps {
  position: Position;
  piece: ChessPiece | null;
  isLight: boolean;
  isHighlighted: boolean;
  highlightType?: 'move' | 'capture';
  onClick: () => void;
}

export function Square({ 
  position, 
  piece, 
  isLight, 
  isHighlighted, 
  highlightType,
  onClick 
}: SquareProps) {
  const baseClasses = "aspect-square flex items-center justify-center cursor-pointer transition-all duration-200";
  const colorClasses = isLight ? "bg-amber-100" : "bg-amber-800";
  
  const getHighlightClasses = () => {
    if (piece && !highlightType) return "ring-4 ring-yellow-400 ring-inset";
    if (highlightType === 'move') return "ring-4 ring-green-400 ring-inset";
    if (highlightType === 'capture') return "ring-4 ring-red-400 ring-inset";
    return "hover:ring-2 hover:ring-blue-300 hover:ring-inset";
  };

  const getCoordinate = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return `${files[position.x]}${ranks[position.y]}`;
  };

  return (
    <div
      className={`
        ${baseClasses} 
        ${colorClasses} 
        ${getHighlightClasses()}
        relative
      `}
      onClick={onClick}
      data-position={getCoordinate()}
    >
      {/* Coordinates */}
      {position.x === 0 && (
        <span className="absolute left-1 top-1 text-xs opacity-50">
          {8 - position.y}
        </span>
      )}
      {position.y === 7 && (
        <span className="absolute right-1 bottom-1 text-xs opacity-50">
          {String.fromCharCode(97 + position.x)}
        </span>
      )}
      
      {/* Piece */}
      <div className={`transform transition-transform duration-200 ${piece ? 'hover:scale-110' : ''}`}>
        {piece && <PieceIcon piece={piece} />}
      </div>
    </div>
  );
}