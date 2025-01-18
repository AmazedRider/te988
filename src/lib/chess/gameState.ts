import type { ChessPiece, PieceColor, Position, GameState } from '../../components/chess/types/chess';
import { calculateValidMoves } from './moveValidation';

export function getInitialPieces(): ChessPiece[] {
  const pieces: ChessPiece[] = [];

  // Setup pawns
  for (let i = 0; i < 8; i++) {
    pieces.push({ type: 'pawn', color: 'white', position: { x: i, y: 6 } });
    pieces.push({ type: 'pawn', color: 'black', position: { x: i, y: 1 } });
  }

  // Setup other pieces
  const setupPiece = (type: ChessPiece['type'], x: number, y: number, color: PieceColor) => {
    pieces.push({ type, color, position: { x, y } });
  };

  ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].forEach((type, i) => {
    setupPiece(type as ChessPiece['type'], i, 7, 'white');
    setupPiece(type as ChessPiece['type'], i, 0, 'black');
  });

  return pieces;
}

export function getInitialGameState(): GameState {
  return {
    pieces: getInitialPieces(),
    currentTurn: 'white',
    selectedPiece: null,
    validMoves: [],
    isCheck: false,
    isCheckmate: false,
    isDraw: false
  };
}

export function movePiece(
  gameState: GameState,
  piece: ChessPiece,
  to: Position
): GameState {
  const newPieces = gameState.pieces.map(p => {
    if (p === piece) {
      return { ...p, position: to, hasMoved: true };
    }
    // Remove captured piece
    if (p.position.x === to.x && p.position.y === to.y) {
      return null;
    }
    return p;
  }).filter((p): p is ChessPiece => p !== null);

  return {
    ...gameState,
    pieces: newPieces,
    currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
    selectedPiece: null,
    validMoves: []
  };
}

export function isValidMove(
  piece: ChessPiece,
  to: Position,
  gameState: GameState
): boolean {
  const validMoves = calculateValidMoves(piece, gameState.pieces);
  return validMoves.some(
    move => move.position.x === to.x && move.position.y === to.y
  );
}