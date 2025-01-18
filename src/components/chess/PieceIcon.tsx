import React from 'react';
import type { ChessPiece } from './types/chess';

interface PieceIconProps {
  piece: ChessPiece;
}

export function PieceIcon({ piece }: PieceIconProps) {
  const getPieceSymbol = () => {
    const symbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    };
    return symbols[piece.color][piece.type];
  };

  // Updated styling for better visibility of black pieces
  const colorClasses = piece.color === 'black' 
    ? 'text-gray-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]' 
    : 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]';

  return <span className={`text-4xl ${colorClasses}`}>{getPieceSymbol()}</span>;
}