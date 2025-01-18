import type { ChessTactic } from '../components/tactics/types/tactics';

export const chessTactics: ChessTactic[] = [
  {
    id: 1,
    name: 'Pin',
    description: 'A pin is when a piece cannot move because it would expose a more valuable piece to capture.',
    initialPosition: '4k3/4n3/8/3B4/8/8/8/4K3 w - - 0 1',
    solution: ['d5e6'],
    explanation: 'The bishop pins the knight to the king, preventing it from moving.'
  },
  {
    id: 2,
    name: 'Fork',
    description: 'A fork is when a piece attacks two or more pieces simultaneously.',
    initialPosition: 'r3k3/8/8/8/3N4/8/8/4K3 w - - 0 1',
    solution: ['d4e6'],
    explanation: 'The knight moves to e6, attacking both the king and rook simultaneously.'
  },
  {
    id: 3,
    name: 'Skewer',
    description: 'A skewer is similar to a pin, but the more valuable piece is in front.',
    initialPosition: 'k7/q7/8/8/8/8/8/R3K3 w - - 0 1',
    solution: ['a1a7'],
    explanation: 'The rook moves to a7, forcing the king to move and allowing white to capture the queen.'
  },
  {
    id: 4,
    name: 'Discovered Attack',
    description: 'A discovered attack occurs when moving one piece reveals an attack from another piece.',
    initialPosition: '4k3/8/8/r7/3N4/8/3B4/4K3 w - - 0 1',
    solution: ['d4f5'],
    explanation: 'Moving the knight reveals the bishop\'s attack on the rook.'
  },
  {
    id: 5,
    name: 'Double Attack',
    description: 'A double attack is when a single move creates two threats simultaneously.',
    initialPosition: '4k3/8/8/8/8/2n5/4Q3/4K3 w - - 0 1',
    solution: ['e2e7'],
    explanation: 'The queen attacks both the knight and creates a mating threat.'
  }
];