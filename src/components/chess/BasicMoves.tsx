import { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { toast } from 'sonner';

const lessons = [
  {
    id: 1,
    title: 'Pawn Movement',
    description:
      'Pawns can move forward one square at a time. On their first move, they can move two squares forward. They capture diagonally.',
    position: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
    validMoves: ['e2e3', 'e2e4'],
    hint: 'Try moving the white pawn forward one or two squares.',
  },
  {
    id: 2,
    title: 'Rook Movement',
    description: 'Rooks move horizontally or vertically any number of squares.',
    position: '4k3/8/8/8/3R4/8/8/4K3 w - - 0 1',
    validMoves: [
      'd4a4',
      'd4b4',
      'd4c4',
      'd4e4',
      'd4f4',
      'd4g4',
      'd4h4',
      'd4d1',
      'd4d2',
      'd4d3',
      'd4d5',
      'd4d6',
      'd4d7',
      'd4d8',
    ],
    hint: 'The rook can move to any square in its row or column.',
  },
  {
    id: 3,
    title: 'Knight Movement',
    description:
      'Knights move in an L-shape: two squares in one direction and then one square perpendicular to that direction.',
    position: '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1',
    validMoves: [
      'd4b3',
      'd4b5',
      'd4c2',
      'd4c6',
      'd4e2',
      'd4e6',
      'd4f3',
      'd4f5',
    ],
    hint: 'The knight moves in an L-shape pattern - try moving it to any of the highlighted squares.',
  },
  {
    id: 4,
    title: 'Bishop Movement',
    description: 'Bishops move diagonally any number of squares.',
    position: '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1',
    validMoves: [
      'd4a1',
      'd4b2',
      'd4c3',
      'd4e5',
      'd4f6',
      'd4g7',
      'd4h8',
      'd4a7',
      'd4b6',
      'd4c5',
      'd4e3',
      'd4f2',
      'd4g1',
    ],
    hint: 'The bishop can move to any square along its diagonals.',
  },
  {
    id: 5,
    title: 'Queen Movement',
    description:
      'Queens can move any number of squares horizontally, vertically, or diagonally.',
    position: '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1',
    validMoves: [
      'd4a1',
      'd4b2',
      'd4c3',
      'd4e5',
      'd4f6',
      'd4g7',
      'd4h8',
      'd4a7',
      'd4b6',
      'd4c5',
      'd4e3',
      'd4f2',
      'd4g1',
      'd4a4',
      'd4b4',
      'd4c4',
      'd4e4',
      'd4f4',
      'd4g4',
      'd4h4',
      'd4d1',
      'd4d2',
      'd4d3',
      'd4d5',
      'd4d6',
      'd4d7',
      'd4d8',
    ],
    hint: 'The queen combines the moves of a rook and bishop - it can move in any direction.',
  },
  {
    id: 6,
    title: 'King Movement',
    description: 'Kings can move one square in any direction.',
    position: '4k3/8/8/8/3K4/8/8/8 w - - 0 1',
    validMoves: [
      'd4c3',
      'd4c4',
      'd4c5',
      'd4d3',
      'd4d5',
      'd4e3',
      'd4e4',
      'd4e5',
    ],
    hint: 'The king can move one square in any direction.',
  },
];

interface BasicMovesProps {
  onComplete: () => void;
  onClose: () => void;
}

export function BasicMoves({ onComplete, onClose }: BasicMovesProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [showHint, setShowHint] = useState(false);

  const user = useAuthStore((state) => state.user);
  const completeLesson = useProgressStore((state) => state.completeLesson);

  useEffect(() => {
    // Initialize game with first lesson
    const newGame = new Chess(lessons[0].position);
    setGame(newGame);
  }, []);

  useEffect(() => {
    if (!game) return;
    // Reset game when lesson changes
    const newGame = new Chess(lessons[currentLesson].position);
    setGame(newGame);
    setSelectedPiece(null);
    setShowHint(false);
  }, [currentLesson]);

  // Show hint after 5 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentLesson, selectedPiece]);

  const getHighlightedSquares = () => {
    if (!game) return {};

    const squares: Record<
      string,
      { background: string; borderRadius?: string }
    > = {};
    const lesson = lessons[currentLesson];

    if (selectedPiece) {
      // Highlight selected piece
      squares[selectedPiece] = {
        background: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '50%',
      };

      // Highlight valid moves
      lesson.validMoves.forEach((move) => {
        if (move.startsWith(selectedPiece)) {
          const targetSquare = move.slice(2, 4);
          squares[targetSquare] = {
            background: 'rgba(0, 255, 0, 0.4)',
            borderRadius: '50%',
          };
        }
      });
    } else if (showHint) {
      // Show piece to move when hint is active
      const pieceSquare = lesson.validMoves[0].slice(0, 2);
      squares[pieceSquare] = {
        background: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '50%',
      };
    }

    return squares;
  };

  const onSquareClick = (square: Square) => {
    if (!game) return;

    const lesson = lessons[currentLesson];

    if (!selectedPiece) {
      // Check if clicked square contains the piece that should move
      if (lesson.validMoves.some((move) => move.startsWith(square))) {
        setSelectedPiece(square);
        setShowHint(false);
      } else {
        toast('Click the piece that can move!');
      }
    } else {
      const move = selectedPiece + square;
      if (lesson.validMoves.includes(move)) {
        // Make the move
        const gameCopy = new Chess(game.fen());
        const result = gameCopy.move({
          from: selectedPiece,
          to: square,
          promotion: 'q',
        });

        if (result) {
          setGame(gameCopy);
          setSelectedPiece(null);
          setShowHint(false);

          // Progress to next lesson or complete
          if (currentLesson === lessons.length - 1) {
            toast.success("Congratulations! You've completed all basic moves!");
            if (user) {
              completeLesson(user.id, 1);
            }
            onComplete();
          } else {
            toast.success('Correct! Moving to next piece.');
            setTimeout(() => {
              setCurrentLesson((prev) => prev + 1);
            }, 1000);
          }
        }
      } else {
        toast.error("That's not a valid move for this piece.");
        setSelectedPiece(null);
      }
    }
  };

  const resetLesson = () => {
    if (!game) return;
    const newGame = new Chess(lessons[currentLesson].position);
    setGame(newGame);
    setSelectedPiece(null);
    setShowHint(false);
  };

  if (!game) {
    return <div className="text-center text-white">Loading...</div>;
  }

  const lesson = lessons[currentLesson];

  return (
    <div className="h-screen max-w-7xl mx-auto px-4 flex flex-col">
      {/* Header - Minimal height */}
      <div className="flex-none py-2">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={resetLesson}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              title="Reset Position"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Position
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Takes remaining height */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 min-h-0 pb-4">
        {/* Game Info - Top on mobile, Left on desktop */}
        <div className="w-full md:w-1/3 bg-white/10 p-4 rounded-lg backdrop-blur-sm flex flex-col gap-4 overflow-auto">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              {lesson.title}
            </h3>
            <p className="text-sm text-gray-200">{lesson.description}</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">
                Progress
              </h4>
              <p className="text-sm text-gray-300">
                Lesson {currentLesson + 1} of {lessons.length}
              </p>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">
                Instructions
              </h4>
              <p className="text-sm text-gray-300">
                {showHint
                  ? lesson.hint
                  : 'Click a piece to see its valid moves, then click a highlighted square to move it.'}
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-auto pt-4">
            {currentLesson > 0 && (
              <button
                onClick={() => setCurrentLesson((prev) => prev - 1)}
                className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous Piece
              </button>
            )}
            {currentLesson < lessons.length - 1 && (
              <button
                onClick={() => setCurrentLesson((prev) => prev + 1)}
                className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200 ml-auto"
              >
                Next Piece
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Chess Board - Bottom on mobile, Right on desktop */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full md:w-[65%] max-w-2xl aspect-square mx-auto">
            <Chessboard
              position={game.fen()}
              onSquareClick={onSquareClick}
              customSquareStyles={getHighlightedSquares()}
              boardOrientation="white"
              areArrowsAllowed={true}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow:
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
