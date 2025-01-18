import type { ChessLesson } from '../components/chess/types/chess';

export const chessLessons: ChessLesson[] = [
  {
    id: 1,
    title: "Pawn Movement",
    piece: "pawn",
    description: "Learn how pawns move and capture.",
    initialPosition: { x: 3, y: 6 },
    validMoves: [
      { x: 3, y: 5 }, // One square forward
      { x: 3, y: 4 }, // Two squares forward (first move)
    ]
  },
  {
    id: 2,
    title: "Rook Movement",
    piece: "rook",
    description: "The rook moves horizontally or vertically.",
    initialPosition: { x: 3, y: 3 },
    validMoves: [
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, 
      { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 },
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
    ]
  },
  {
    id: 3,
    title: "Knight Movement",
    piece: "knight",
    description: "Knights move in an L-shape pattern.",
    initialPosition: { x: 3, y: 3 },
    validMoves: [
      { x: 1, y: 2 }, { x: 1, y: 4 },
      { x: 2, y: 1 }, { x: 2, y: 5 },
      { x: 4, y: 1 }, { x: 4, y: 5 },
      { x: 5, y: 2 }, { x: 5, y: 4 }
    ]
  },
  {
    id: 4,
    title: "Bishop Movement",
    piece: "bishop",
    description: "Bishops move diagonally.",
    initialPosition: { x: 3, y: 3 },
    validMoves: [
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 },
      { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 },
      { x: 0, y: 6 }, { x: 1, y: 5 }, { x: 2, y: 4 },
      { x: 4, y: 2 }, { x: 5, y: 1 }, { x: 6, y: 0 }
    ]
  }
];