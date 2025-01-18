import type { ChessPiece, Position, GameState, ValidMove } from '../../components/chess/types/chess';
import { calculateValidMoves } from './moveValidation';
import { isKingInCheck, isCheckmate } from './gameRules';

// Piece values for evaluation
const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Position bonuses for better piece placement
const POSITION_BONUSES = {
  pawn: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  rook: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  queen: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,   0,  5,  5,  5,  5,  0, -5],
    [0,    0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20,  20,  0,  0,  0,  0, 20, 20],
    [20,  30, 10,  0,  0, 10, 30, 20]
  ]
};

function evaluatePosition(piece: ChessPiece): number {
  const { type, color, position } = piece;
  const baseValue = PIECE_VALUES[type];
  
  // Get position bonus
  const bonus = POSITION_BONUSES[type][color === 'white' ? position.y : 7 - position.y][position.x];
  
  return color === 'black' ? baseValue + bonus : -(baseValue + bonus);
}

function evaluateBoard(pieces: ChessPiece[]): number {
  return pieces.reduce((sum, piece) => sum + evaluatePosition(piece), 0);
}

function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) return evaluateBoard(gameState.pieces);
  if (isCheckmate(gameState)) return isMaximizing ? -Infinity : Infinity;

  const moves = getAllPossibleMoves(gameState.pieces, isMaximizing ? 'black' : 'white');
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(gameState, move.piece, move.to);
      const evaluation = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(gameState, move.piece, move.to);
      const evaluation = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getAllPossibleMoves(pieces: ChessPiece[], color: 'white' | 'black'): { piece: ChessPiece; to: Position }[] {
  const moves: { piece: ChessPiece; to: Position }[] = [];
  
  pieces.forEach(piece => {
    if (piece.color === color) {
      const validMoves = calculateValidMoves(piece, pieces);
      validMoves.forEach(move => {
        moves.push({ piece, to: move.position });
      });
    }
  });
  
  return moves;
}

function makeMove(gameState: GameState, piece: ChessPiece, to: Position): GameState {
  const newPieces = gameState.pieces.map(p => {
    if (p === piece) {
      return { ...p, position: to };
    }
    if (p.position.x === to.x && p.position.y === to.y) {
      return null; // Captured piece
    }
    return p;
  }).filter((p): p is ChessPiece => p !== null);

  return {
    ...gameState,
    pieces: newPieces,
    currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white'
  };
}

export function getBestMove(gameState: GameState): { piece: ChessPiece; to: Position } | null {
  const moves = getAllPossibleMoves(gameState.pieces, 'black');
  let bestMove = null;
  let bestValue = -Infinity;
  
  for (const move of moves) {
    const newState = makeMove(gameState, move.piece, move.to);
    const value = minimax(newState, 3, -Infinity, Infinity, false);
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return bestMove;
}