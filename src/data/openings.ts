import type { ChessOpening } from '../components/openings/types/opening';

export const chessOpenings: ChessOpening[] = [
  {
    id: '5', // Using numeric strings for consistent ID handling
    name: "King's Pawn Opening",
    description: "A classic opening that immediately fights for the center with 1.e4. Black responds symmetrically, leading to an open game.",
    moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1'],
  },
  {
    id: '6',
    name: "Queen's Gambit",
    description: "A fundamental opening where White offers a pawn to gain central control. Black can accept or decline the gambit.",
    moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c1g5', 'f8e7', 'e2e3'],
  },
  {
    id: '7',
    name: "Sicilian Defense",
    description: "A sharp defense against 1.e4 where Black fights for the center asymmetrically, leading to complex tactical play.",
    moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3'],
  },
];