import type { ChessPiece, Position, ValidMove } from '../../components/chess/types/chess';

function isWithinBoard(position: Position): boolean {
  return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
}

function getPieceAt(position: Position, pieces: ChessPiece[]): ChessPiece | null {
  return pieces.find(p => p.position.x === position.x && p.position.y === position.y) || null;
}

function isCapturablePosition(position: Position, piece: ChessPiece, pieces: ChessPiece[]): boolean {
  const targetPiece = getPieceAt(position, pieces);
  return targetPiece !== null && targetPiece.color !== piece.color;
}

export function calculateValidMoves(piece: ChessPiece, pieces: ChessPiece[]): ValidMove[] {
  const validMoves: ValidMove[] = [];
  const { type, color, position } = piece;

  switch (type) {
    case 'pawn': {
      const direction = color === 'white' ? -1 : 1;
      const startRank = color === 'white' ? 6 : 1;

      // Forward move
      const oneStep = { x: position.x, y: position.y + direction };
      if (isWithinBoard(oneStep) && !getPieceAt(oneStep, pieces)) {
        validMoves.push({ position: oneStep, type: 'move' });

        // Initial two-square move
        if (position.y === startRank) {
          const twoStep = { x: position.x, y: position.y + (direction * 2) };
          if (!getPieceAt(twoStep, pieces)) {
            validMoves.push({ position: twoStep, type: 'move' });
          }
        }
      }

      // Captures
      const captures = [
        { x: position.x - 1, y: position.y + direction },
        { x: position.x + 1, y: position.y + direction }
      ];

      captures.forEach(capturePos => {
        if (isWithinBoard(capturePos) && isCapturablePosition(capturePos, piece, pieces)) {
          validMoves.push({ position: capturePos, type: 'capture' });
        }
      });
      break;
    }

    case 'knight': {
      const knightMoves = [
        { x: position.x + 2, y: position.y + 1 },
        { x: position.x + 2, y: position.y - 1 },
        { x: position.x - 2, y: position.y + 1 },
        { x: position.x - 2, y: position.y - 1 },
        { x: position.x + 1, y: position.y + 2 },
        { x: position.x + 1, y: position.y - 2 },
        { x: position.x - 1, y: position.y + 2 },
        { x: position.x - 1, y: position.y - 2 }
      ];

      knightMoves.forEach(move => {
        if (isWithinBoard(move)) {
          const targetPiece = getPieceAt(move, pieces);
          if (!targetPiece) {
            validMoves.push({ position: move, type: 'move' });
          } else if (targetPiece.color !== color) {
            validMoves.push({ position: move, type: 'capture' });
          }
        }
      });
      break;
    }

    case 'bishop': {
      const directions = [
        { x: 1, y: 1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: -1, y: -1 }
      ];

      directions.forEach(dir => {
        let current = { x: position.x + dir.x, y: position.y + dir.y };
        while (isWithinBoard(current)) {
          const targetPiece = getPieceAt(current, pieces);
          if (!targetPiece) {
            validMoves.push({ position: current, type: 'move' });
          } else {
            if (targetPiece.color !== color) {
              validMoves.push({ position: current, type: 'capture' });
            }
            break;
          }
          current = { x: current.x + dir.x, y: current.y + dir.y };
        }
      });
      break;
    }

    case 'rook': {
      const directions = [
        { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 0 }, { x: -1, y: 0 }
      ];

      directions.forEach(dir => {
        let current = { x: position.x + dir.x, y: position.y + dir.y };
        while (isWithinBoard(current)) {
          const targetPiece = getPieceAt(current, pieces);
          if (!targetPiece) {
            validMoves.push({ position: current, type: 'move' });
          } else {
            if (targetPiece.color !== color) {
              validMoves.push({ position: current, type: 'capture' });
            }
            break;
          }
          current = { x: current.x + dir.x, y: current.y + dir.y };
        }
      });
      break;
    }

    case 'queen': {
      const directions = [
        { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 1, y: 1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: -1, y: -1 }
      ];

      directions.forEach(dir => {
        let current = { x: position.x + dir.x, y: position.y + dir.y };
        while (isWithinBoard(current)) {
          const targetPiece = getPieceAt(current, pieces);
          if (!targetPiece) {
            validMoves.push({ position: current, type: 'move' });
          } else {
            if (targetPiece.color !== color) {
              validMoves.push({ position: current, type: 'capture' });
            }
            break;
          }
          current = { x: current.x + dir.x, y: current.y + dir.y };
        }
      });
      break;
    }

    case 'king': {
      const directions = [
        { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 1, y: 1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: -1, y: -1 }
      ];

      directions.forEach(dir => {
        const move = { x: position.x + dir.x, y: position.y + dir.y };
        if (isWithinBoard(move)) {
          const targetPiece = getPieceAt(move, pieces);
          if (!targetPiece) {
            validMoves.push({ position: move, type: 'move' });
          } else if (targetPiece.color !== color) {
            validMoves.push({ position: move, type: 'capture' });
          }
        }
      });
      break;
    }
  }

  return validMoves;
}