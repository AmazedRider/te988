export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface ValidMove {
  position: Position;
  type: 'move' | 'capture' | 'special';
}

export interface Square {
  position: Position;
  isHighlighted: boolean;
  piece: ChessPiece | null;
}

export interface ChessLesson {
  id: number;
  title: string;
  piece: PieceType;
  description: string;
  initialPosition: Position;
  validMoves: Position[];
}

export interface GameState {
  pieces: ChessPiece[];
  currentTurn: PieceColor;
  selectedPiece: ChessPiece | null;
  validMoves: ValidMove[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}