import type { ChessPiece } from '../components/chess/types/chess';

interface EndgameLesson {
  id: number;
  title: string;
  description: string;
  instruction: string;
  keyPoints: string[];
  pieces: ChessPiece[];
  playerColor: 'white' | 'black';
  targetPositions?: { x: number; y: number }[];
  winCondition?: (pieces: ChessPiece[]) => boolean;
  category: 'basic' | 'intermediate' | 'advanced';
  concepts: string[];
  commonMistakes: string[];
  tips: string[];
}

export const endgameLessons: EndgameLesson[] = [
  {
    id: 1,
    title: "King and Pawn vs King",
    description: "Learn how to promote a pawn with the help of your king.",
    instruction: "Move your pawn to the other side of the board to promote it. Use your king to protect the pawn.",
    keyPoints: [
      "Keep your king close to the pawn",
      "Push the pawn forward when safe",
      "Don't let the enemy king get in front of your pawn"
    ],
    pieces: [
      { type: 'king', color: 'white', position: { x: 4, y: 6 } },
      { type: 'pawn', color: 'white', position: { x: 4, y: 5 } },
      { type: 'king', color: 'black', position: { x: 4, y: 1 } }
    ],
    playerColor: 'white',
    category: 'basic',
    concepts: [
      "Pawn promotion",
      "King support",
      "Basic endgame"
    ],
    commonMistakes: [
      "Moving the pawn too early",
      "Keeping the king too far from the pawn"
    ],
    tips: [
      "Keep your king in front of the pawn",
      "Advance the pawn when it's safe",
      "Use your king to clear the path"
    ],
    winCondition: (pieces: ChessPiece[]): boolean => {
      // Win if white pawn reaches 7th or 8th rank (y = 1 or y = 0)
      return pieces.some(p => 
        p.type === 'pawn' && 
        p.color === 'white' && 
        (p.position.y === 1 || p.position.y === 0)
      );
    }
  },
  {
    id: 2,
    title: "Queen vs Lone King",
    description: "Learn how to checkmate with a queen against a lone king.",
    instruction: "Use your queen to force the enemy king to the edge of the board, then deliver checkmate.",
    keyPoints: [
      "Use your queen to restrict the enemy king's movement",
      "Push the king towards the edge",
      "Keep your own king safe"
    ],
    pieces: [
      { type: 'king', color: 'white', position: { x: 4, y: 7 } },
      { type: 'queen', color: 'white', position: { x: 3, y: 6 } },
      { type: 'king', color: 'black', position: { x: 4, y: 2 } }
    ],
    playerColor: 'white',
    category: 'basic',
    concepts: [
      "Queen checkmate",
      "Basic checkmate pattern",
      "Piece coordination"
    ],
    commonMistakes: [
      "Allowing stalemate",
      "Moving the queen too far from the king"
    ],
    tips: [
      "Use your queen to control key squares",
      "Keep the enemy king on the edge",
      "Watch out for stalemate"
    ],
    winCondition: (pieces: ChessPiece[]): boolean => {
      // Win if black king is not present (checkmate)
      return !pieces.some(p => p.type === 'king' && p.color === 'black');
    }
  },
  {
    id: 3,
    title: "Rook vs Lone King",
    description: "Master the basic rook checkmate against a lone king.",
    instruction: "Use your rook to force the enemy king to the edge, then deliver checkmate with support from your king.",
    keyPoints: [
      "Use your rook to cut off ranks",
      "Keep your king close to support the rook",
      "Force the enemy king to the edge"
    ],
    pieces: [
      { type: 'king', color: 'white', position: { x: 5, y: 6 } },
      { type: 'rook', color: 'white', position: { x: 0, y: 7 } },
      { type: 'king', color: 'black', position: { x: 4, y: 2 } }
    ],
    playerColor: 'white',
    category: 'basic',
    concepts: [
      "Rook checkmate",
      "Basic checkmate pattern",
      "King and rook coordination"
    ],
    commonMistakes: [
      "Allowing stalemate",
      "Not using the rook effectively"
    ],
    tips: [
      "Use your rook to control ranks",
      "Keep your king close",
      "Push the enemy king to the edge"
    ],
    winCondition: (pieces: ChessPiece[]): boolean => {
      // Win if black king is not present (checkmate)
      return !pieces.some(p => p.type === 'king' && p.color === 'black');
    }
  }
];