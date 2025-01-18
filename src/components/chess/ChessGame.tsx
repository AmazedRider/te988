import React, { useState } from 'react';
import { ChessBoard } from './ChessBoard';
import { GameControls } from './GameControls';
import { GameInstructions } from './GameInstructions';
import { ArrowLeft } from 'lucide-react';
import { getInitialGameState, movePiece, isValidMove } from '../../lib/chess/gameState';
import { calculateValidMoves } from '../../lib/chess/moveValidation';
import type { ChessPiece, Position, GameState } from './types/chess';

interface ChessGameProps {
  onClose: () => void;
}

export function ChessGame({ onClose }: ChessGameProps) {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());

  const handlePieceMove = (piece: ChessPiece, to: Position) => {
    if (piece.color !== gameState.currentTurn) return;
    if (!isValidMove(piece, to, gameState)) return;

    setGameState(prevState => movePiece(prevState, piece, to));
  };

  const handleReset = () => {
    setGameState(getInitialGameState());
  };

  const handleResign = () => {
    const winner = gameState.currentTurn === 'white' ? 'Black' : 'White';
    alert(`${winner} wins by resignation!`);
    handleReset();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <GameControls
          onReset={handleReset}
          onResign={handleResign}
          currentTurn={gameState.currentTurn}
        />

        <GameInstructions />
      </div>

      <div className="aspect-square max-w-2xl mx-auto">
        <ChessBoard
          pieces={gameState.pieces}
          highlightedSquares={gameState.selectedPiece 
            ? gameState.validMoves.map(move => move.position)
            : []}
          onSquareClick={(position) => {
            const piece = gameState.pieces.find(
              p => p.position.x === position.x && p.position.y === position.y
            );
            if (piece && piece.color === gameState.currentTurn) {
              const validMoves = calculateValidMoves(piece, gameState.pieces);
              setGameState(prev => ({
                ...prev,
                selectedPiece: piece,
                validMoves
              }));
            } else if (gameState.selectedPiece && isValidMove(gameState.selectedPiece, position, gameState)) {
              handlePieceMove(gameState.selectedPiece, position);
            }
          }}
        />
      </div>

      <div className="mt-4 text-center text-gray-300">
        {gameState.isCheckmate 
          ? `Checkmate! ${gameState.currentTurn === 'white' ? 'Black' : 'White'} wins!`
          : gameState.isCheck
          ? `Check! ${gameState.currentTurn}'s turn to move`
          : `${gameState.currentTurn}'s turn to move`}
      </div>
    </div>
  );
}