import type { ChessPiece, Position, GameState } from '../../components/chess/types/chess';
import { calculateValidMoves } from './moveValidation';

export function isKingInCheck(pieces: ChessPiece[], kingColor: 'white' | 'black'): boolean {
  // Find king's position
  const king = pieces.find(p => p.type === 'king' && p.color === kingColor);
  if (!king) return false;

  // Check if any opponent piece can capture the king
  return pieces.some(piece => {
    if (piece.color === kingColor) return false;
    const moves = calculateValidMoves(piece, pieces);
    return moves.some(move => 
      move.position.x === king.position.x && 
      move.position.y === king.position.y
    );
  });
}

export function isCheckmate(gameState: GameState): boolean {
  const { pieces, currentTurn } = gameState;
  
  // If not in check, can't be checkmate
  if (!isKingInCheck(pieces, currentTurn)) return false;

  // Try all possible moves to see if any get out of check
  return !pieces.some(piece => {
    if (piece.color !== currentTurn) return false;
    
    const moves = calculateValidMoves(piece, pieces);
    return moves.some(move => {
      // Try the move
      const newPieces = pieces.map(p => {
        if (p === piece) {
          return { ...p, position: move.position };
        }
        if (p.position.x === move.position.x && p.position.y === move.position.y) {
          return null; // Captured piece
        }
        return p;
      }).filter((p): p is ChessPiece => p !== null);

      // Check if this move gets out of check
      return !isKingInCheck(newPieces, currentTurn);
    });
  });
}

export function isStalemate(gameState: GameState): boolean {
  const { pieces, currentTurn } = gameState;
  
  // If in check, not stalemate
  if (isKingInCheck(pieces, currentTurn)) return false;

  // If no legal moves available, it's stalemate
  return !pieces.some(piece => {
    if (piece.color !== currentTurn) return false;
    const moves = calculateValidMoves(piece, pieces);
    return moves.length > 0;
  });
}

export function handlePawnPromotion(piece: ChessPiece, position: Position): ChessPiece {
  if (piece.type !== 'pawn') return piece;

  const promotionRank = piece.color === 'white' ? 0 : 7;
  if (position.y === promotionRank) {
    return {
      ...piece,
      type: 'queen', // Always promote to queen for simplicity
      position
    };
  }

  return { ...piece, position };
}