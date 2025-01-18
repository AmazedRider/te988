import { useState } from 'react';
import { ArrowLeft, LogIn, RotateCcw, Swords, Trophy } from 'lucide-react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

interface ChessPassAndPlayProps {
  onClose: () => void;
}

export function ChessPassAndPlay({ onClose }: ChessPassAndPlayProps) {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<string>('');
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const { isGuest } = useAuthStore();

  // Get legal moves for a piece
  const getLegalMovesForPiece = (square: Square) => {
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to);
  };

  // Function to check if game is over and update state
  const checkGameOver = (chessInstance: Chess) => {
    if (chessInstance.isGameOver()) {
      setGameOver(true);
      if (chessInstance.isCheckmate()) {
        const winner = chessInstance.turn() === 'w' ? 'Black' : 'White';
        setResult(`${winner} wins by checkmate!`);
        toast(`${winner} wins by checkmate!`, {
          icon: '🏆'
        });
      } else if (chessInstance.isDraw()) {
        setResult('Game drawn!');
        toast('Game drawn!');
      } else if (chessInstance.isStalemate()) {
        setResult('Game drawn by stalemate!');
        toast('Game drawn by stalemate!');
      }
      return true;
    }
    return false;
  };

  // Custom square styling
  const customSquareStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(0, 100, 255, 0.3)',
        borderRadius: '4px',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(0, 100, 255, 0.3)',
        borderRadius: '4px',
      };
    }

    // Highlight king in check
    if (game.isCheck()) {
      // Find the king's position
      const board = game.board();
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (piece && piece.type === 'k' && piece.color === game.turn()) {
            const file = 'abcdefgh'[j];
            const rank = 8 - i;
            const square = `${file}${rank}` as Square;
            styles[square] = {
              backgroundColor: 'rgba(255, 0, 0, 0.4)',
              borderRadius: '4px',
            };
          }
        }
      }
    }

    // Highlight selected piece
    if (selectedPiece) {
      styles[selectedPiece] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        borderRadius: '4px',
      };

      // Get all legal moves with their details
      const moves = game.moves({ square: selectedPiece, verbose: true });
      
      // Highlight legal moves
      moves.forEach(move => {
        // If it's a capture move, highlight in red
        if (move.captured || move.flags.includes('e')) { // 'e' is for en passant capture
          styles[move.to] = {
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderRadius: '50%',
            boxShadow: 'inset 0 0 0 2px rgba(255, 0, 0, 0.4)',
          };
        } else {
          // Regular move, highlight in green
          styles[move.to] = {
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderRadius: '50%',
            boxShadow: 'inset 0 0 0 2px rgba(0, 255, 0, 0.4)',
          };
        }
      });
    }

    return styles;
  };

  // Handle piece selection
  const onPieceClick = (_piece: any, square: Square) => {
    if (gameOver) return;
    
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedPiece(square);
    }
  };

  // Handle square click for move
  const onSquareClick = (square: Square) => {
    if (!selectedPiece || gameOver) return;

    const legalMoves = getLegalMovesForPiece(selectedPiece);
    if (legalMoves.includes(square)) {
      handleMove(selectedPiece, square);
    }
    setSelectedPiece(null);
  };

  // Handle player move
  const handleMove = (from: string, to: string): boolean => {
    if (gameOver) return false;

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from,
        to,
        promotion: 'q'
      });

      if (!move) return false;

      setGame(newGame);
      setSelectedPiece(null);
      setLastMove({ from: from as Square, to: to as Square });
      
      // Check if game is over after move
      checkGameOver(newGame);
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      return false;
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameOver(false);
    setResult('');
    setSelectedPiece(null);
    setLastMove(null);
  };

  if (gameOver) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center space-y-6 py-12">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white">Game Over!</h3>
          <p className="text-xl text-gray-200">{result}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold shadow-lg"
            >
              Back to Dashboard
            </button>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
            >
              Play Again
              <Swords className="w-5 h-5" />
            </button>
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
              onClick={resetGame}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              title="Reset Game"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Game
            </button>
            {isGuest && (
              <button
                onClick={() => useAuthStore.setState({ isGuest: false })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                Sign in to save progress
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content - Takes remaining height */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 min-h-0 pb-4">
        {/* Game Info - Top on mobile, Left on desktop */}
        <div className="w-full md:w-1/3 bg-white/10 p-4 rounded-lg backdrop-blur-sm flex flex-col gap-4 overflow-auto">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Pass and Play</h3>
            <p className="text-sm text-gray-200">Play chess with a friend!</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Game Status</h4>
              <p className="text-sm text-gray-300">
                {game.turn() === 'w' ? "White's turn" : "Black's turn"}
                {game.isCheck() ? " - Check!" : ""}
              </p>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Current Turn</h4>
              <p className="text-sm text-gray-300">
                {game.turn() === 'w' ? "White to move" : "Black to move"}
              </p>
            </div>
          </div>
        </div>

        {/* Chess Board - Bottom on mobile, Right on desktop */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full md:w-[65%] max-w-2xl aspect-square mx-auto">
            <Chessboard
              position={game.fen()}
              onPieceDrop={handleMove}
              onSquareClick={onSquareClick}
              onPieceClick={onPieceClick}
              boardOrientation="white"
              customSquareStyles={customSquareStyles()}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 