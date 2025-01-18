export interface ChessOpening {
  id: string;
  name: string;
  description: string;
  moves: string[];
  fen?: string;
}

export interface OpeningMove {
  from: string;
  to: string;
  piece: string;
  color: 'w' | 'b';
}