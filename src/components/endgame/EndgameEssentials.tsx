import { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RotateCcw, ArrowLeft, HelpCircle, BookOpen, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { endgameLessons } from '../../data/endgameLessons';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { toast } from 'sonner';

interface EndgameEssentialsProps {
  onClose: () => void;
  onComplete: () => void;
}

// Convert piece array to FEN string
function piecesToFen(pieces: any[]): string {
  // Create an 8x8 empty board
  const board = Array(8).fill(null).map(() => Array(8).fill(''));

  // Place pieces on the board
  pieces.forEach(piece => {
    const symbol = piece.type.charAt(0).toLowerCase();
    const finalSymbol = piece.color === 'white' ? symbol.toUpperCase() : symbol;
    board[piece.position.y][piece.position.x] = finalSymbol;
  });

  // Convert board to FEN
  const rows = board.map(row => {
    let fen = '';
    let emptyCount = 0;

    row.forEach(square => {
      if (square === '') {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += square;
      }
    });

    if (emptyCount > 0) {
      fen += emptyCount;
    }

    return fen;
  });

  // Join rows with '/' and add default FEN suffixes for turn, castling, etc.
  return rows.join('/') + ' w - - 0 1';
}

// Convert FEN to piece array
function fenToPieces(fen: string): any[] {
  const pieces: any[] = [];
  const [position] = fen.split(' ');
  const rows = position.split('/');

  rows.forEach((row, y) => {
    let x = 0;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (/[1-8]/.test(char)) {
        x += parseInt(char);
      } else {
        const piece = {
          type: getPieceType(char.toLowerCase()),
          color: char === char.toUpperCase() ? 'white' : 'black',
          position: { x, y }
        };
        pieces.push(piece);
        x++;
      }
    }
  });

  return pieces;
}

function getPieceType(symbol: string): string {
  const types: Record<string, string> = {
    'k': 'king',
    'q': 'queen',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight',
    'p': 'pawn'
  };
  return types[symbol];
}

export function EndgameEssentials({ onClose, onComplete }: EndgameEssentialsProps) {
  const [game, setGame] = useState<Chess>(new Chess());
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set<number>());
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const completeLesson = useProgressStore(state => state.completeLesson);

  const currentLesson = endgameLessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === endgameLessons.length - 1;
  const isAllComplete = completedLessons.size === endgameLessons.length;

  useEffect(() => {
    resetLesson();
  }, [currentLessonIndex]);

  const handleMove = (from: string, to: string): boolean => {
    const move = game.move({ from, to, promotion: 'q' });
    if (!move) {
      toast.error('Invalid move');
      return false;
    }

    const newGame = new Chess(game.fen());
    setGame(newGame);
    setSelectedPiece(null);
    setIsThinking(true);

    // Check position after white's move
    checkPosition(newGame);

    // Make black's move after a delay
    setTimeout(() => {
      try {
        const blackMove = findBestBlackMove(newGame);
        if (blackMove) {
          newGame.move(blackMove);
          setGame(newGame);
          
          // Check position after black's move
          checkPosition(newGame);
        }
      } catch (error) {
        console.error('Error making black move:', error);
      } finally {
        setIsThinking(false);
      }
    }, 500);

    return true;
  };

  const checkPosition = (currentGame: Chess) => {
    const pieces = fenToPieces(currentGame.fen());
    const isWinningPosition = currentLesson.winCondition?.(pieces) || currentGame.isCheckmate();

    if (isWinningPosition) {
      handleWin();
    }
  };

  const handleWin = () => {
    toast.success('Excellent move! You\'ve completed this lesson.', {
      duration: 3000,
    });
    
    // Mark lesson as completed
    setCompletedLessons(prev => new Set(prev).add(currentLessonIndex));
    
    // Save progress
    if (user && !completedLessons.has(currentLessonIndex)) {
      completeLesson(user.id, 4)
        .then(() => {
          toast.success('Lesson progress saved!');
        })
        .catch(error => {
          console.error('Error saving progress:', error);
          toast.error('Failed to save progress');
        });
    }
    
    // Handle completion
    if (currentLessonIndex === endgameLessons.length - 1) {
      onComplete();
      onClose();
    } else {
      // Show completion prompt
      setTimeout(() => {
        setShowNextPrompt(true);
      }, 1500);
    }
  };

  const findBestBlackMove = (currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true });
    
    // Try to find a move that prevents checkmate or delays the win condition
    for (const move of moves) {
      const testGame = new Chess(currentGame.fen());
      testGame.move(move);
      
      // Check if this move prevents an immediate win
      const pieces = fenToPieces(testGame.fen());
      if (!currentLesson.winCondition?.(pieces) && !testGame.isCheckmate()) {
        return move;
      }
    }
    
    // If no good defensive move found, make a random legal move
    if (moves.length > 0) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    
    return null;
  };

  const resetLesson = () => {
    const newGame = new Chess();
    const fen = piecesToFen(currentLesson.pieces);
    newGame.load(fen);
    setGame(newGame);
    setShowNextPrompt(false);
    setShowHint(false);
    setSelectedPiece(null);
  };

  const getHighlightedSquares = () => {
    const squares: Record<string, { background: string; borderRadius?: string }> = {};
    
    if (selectedPiece) {
      // Highlight selected piece
      squares[selectedPiece] = {
        background: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '50%'
      };

      // Highlight legal moves
      const moves = game.moves({ square: selectedPiece, verbose: true });
      moves.forEach(move => {
        squares[move.to] = {
          background: 'rgba(0, 255, 0, 0.4)',
          borderRadius: '50%'
        };
      });
    } else if (showHint) {
      // Find a good move and highlight it
      const moves = game.moves({ verbose: true });
      for (const move of moves) {
        const testGame = new Chess(game.fen());
        testGame.move(move);
        const pieces = fenToPieces(testGame.fen());
        if (currentLesson.winCondition?.(pieces)) {
          squares[move.from] = {
            background: 'rgba(255, 255, 0, 0.4)',
            borderRadius: '50%'
          };
          squares[move.to] = {
            background: 'rgba(0, 255, 0, 0.4)',
            borderRadius: '50%'
          };
          break;
        }
      }
    }

    return squares;
  };

  const handleNext = () => {
    setCurrentLessonIndex(prev => Math.min(prev + 1, endgameLessons.length - 1));
    setShowNextPrompt(false);
  };

  const handleShowHint = () => {
    setShowHint(true);
    // Find and show a winning move
    const moves = game.moves({ verbose: true });
    for (const move of moves) {
      const testGame = new Chess(game.fen());
      testGame.move(move);
      
      const pieces = fenToPieces(testGame.fen());
      if (currentLesson.winCondition?.(pieces)) {
        toast.success(
          <div>
            <div>Move the piece from {move.from} to {move.to}</div>
            <div className="text-sm mt-1">The piece is highlighted in yellow, and the target square in green</div>
          </div>,
          { duration: 5000 }
        );
        return;
      }
    }
    toast.error('No winning move found from this position. Try resetting the lesson.');
  };

  const onSquareClick = (square: Square) => {
    if (showNextPrompt || isThinking) return;

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedPiece(square);
      setShowHint(false);
    } else if (selectedPiece) {
      handleMove(selectedPiece, square);
    }
  };

  if (showIntro) {
    return (
      <div className="h-screen max-w-7xl mx-auto px-4 flex flex-col">
        <div className="text-center py-12 text-white">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-6">Endgame Essentials</h2>
          <p className="text-xl mb-8">
            Master crucial endgame techniques that will improve your chess game.
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm mb-8">
            <h3 className="text-xl font-semibold mb-4">Why Study Endgames?</h3>
            <ul className="text-left space-y-3 text-gray-200">
              <li>• Improve your winning chances in equal positions</li>
              <li>• Learn essential checkmate patterns</li>
              <li>• Understand key concepts like opposition and zugzwang</li>
              <li>• Master pawn promotion techniques</li>
              <li>• Develop better piece coordination</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Basic Techniques</h4>
              <ul className="text-gray-200 text-sm">
                {endgameLessons.filter(l => l.category === 'basic').map(lesson => (
                  <li key={lesson.id} className="flex items-center gap-2">
                    {completedLessons.has(lesson.id - 1) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Intermediate Techniques</h4>
              <ul className="text-gray-200 text-sm">
                {endgameLessons.filter(l => l.category === 'intermediate').map(lesson => (
                  <li key={lesson.id} className="flex items-center gap-2">
                    {completedLessons.has(lesson.id - 1) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setShowIntro(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  if (isAllComplete) {
    return (
      <div className="h-screen max-w-7xl mx-auto px-4 flex flex-col">
        <div className="text-center py-12 text-white">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
          <p className="text-gray-200">You've mastered all endgame essentials!</p>
          <div className="space-x-4 mt-4">
            <button
              onClick={() => {
                setCompletedLessons(new Set());
                setCurrentLessonIndex(0);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
            >
              Practice Again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-semibold shadow-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showNextPrompt) {
    return (
      <div className="h-screen max-w-7xl mx-auto px-4 flex flex-col">
        <div className="text-center space-y-6 py-12">
          <h3 className="text-2xl font-bold text-white">
            Congratulations! 🎉
          </h3>
          <p className="text-xl text-gray-200">
            You've mastered the {currentLesson.title}!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold shadow-lg"
            >
              Back to Dashboard
            </button>
            {!isLastLesson && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
              >
                Next Lesson
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              onClick={handleShowHint}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              title="Show Hint"
            >
              <HelpCircle className="w-5 h-5" />
              Hint
            </button>
            <button
              onClick={resetLesson}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              title="Reset Position"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Position
            </button>
            <div className="text-white">
              {completedLessons.size}/{endgameLessons.length} Complete
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Takes remaining height */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 min-h-0 pb-4">
        {/* Game Info - Top on mobile, Left on desktop */}
        <div className="w-full md:w-1/3 bg-white/10 p-4 rounded-lg backdrop-blur-sm flex flex-col gap-4 overflow-auto">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">{currentLesson.title}</h3>
            <p className="text-sm text-gray-200">{currentLesson.description}</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Instructions</h4>
              <p className="text-sm text-gray-300">{currentLesson.instruction}</p>
              <p className="text-sm text-gray-400 mt-2">
                {isThinking ? "Black is thinking..." : "Your turn"}
              </p>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Key Points</h4>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                {currentLesson.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Tips</h4>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                {currentLesson.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Chess Board - Bottom on mobile, Right on desktop */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full md:w-[65%] max-w-2xl aspect-square mx-auto">
            <Chessboard
              position={game.fen()}
              onPieceDrop={(from, to) => handleMove(from, to)}
              onSquareClick={onSquareClick}
              customSquareStyles={getHighlightedSquares()}
              boardOrientation={currentLesson.playerColor}
              areArrowsAllowed={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}