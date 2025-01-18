import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, LogIn, RotateCcw, Swords, Trophy } from 'lucide-react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

interface ChessBotProps {
  onClose: () => void;
}

export function ChessBot({ onClose }: ChessBotProps) {
  const [game, setGame] = useState<Chess>(new Chess());
  const [isThinking, setIsThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<string>('');
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const { isGuest } = useAuthStore();

  // Simple piece values for evaluation
  const pieceValues = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
  };

  // Evaluate board position
  const evaluatePosition = (board: any[][]): number => {
    let score = 0;
    
    // Material score
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type as keyof typeof pieceValues] || 0;
          // Add small bonus for controlling center squares
          const centerBonus = (i >= 2 && i <= 5 && j >= 2 && j <= 5) ? 10 : 0;
          score += piece.color === 'b' ? (value + centerBonus) : -(value + centerBonus);
        }
      }
    }
    
    return score;
  };

  // Function to check if game is over and update state
  const checkGameOver = (chessInstance: Chess) => {
    if (chessInstance.isGameOver()) {
      setGameOver(true);
      if (chessInstance.isCheckmate()) {
        const winner = chessInstance.turn() === 'w' ? 'Black' : 'White';
        setResult(`${winner} wins by checkmate!`);
        toast(winner === 'White' ? 'Congratulations! You won!' : 'The bot won!', {
          icon: winner === 'White' ? '🎉' : '😔'
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

  // Get legal moves for a piece
  const getLegalMovesForPiece = (square: Square) => {
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to);
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
    if (isThinking || gameOver || game.turn() !== playerColor) return;
    
    const piece = game.get(square);
    if (piece && piece.color === playerColor) {
      setSelectedPiece(square);
    }
  };

  // Handle square click for move
  const onSquareClick = (square: Square) => {
    if (!selectedPiece || isThinking || gameOver || game.turn() !== playerColor) return;

    const legalMoves = getLegalMovesForPiece(selectedPiece);
    if (legalMoves.includes(square)) {
      handleMove(selectedPiece, square);
    }
    setSelectedPiece(null);
  };

  // Bot move logic
  const makeBotMove = useCallback(() => {
    // Bot should only move when it's not the player's turn and game isn't over
    if (gameOver || game.turn() === playerColor || !playerColor) return;

    // Determine bot's color (opposite of player's color)
    const botColor = playerColor === 'w' ? 'b' : 'w';
    
    // Only make a move if it's the bot's turn
    if (game.turn() !== botColor) return;

    setIsThinking(true);
    
    setTimeout(() => {
      try {
        const possibleMoves = game.moves({ verbose: true });
        if (possibleMoves.length === 0) {
          setIsThinking(false);
          return;
        }

        // Find best move with some randomization for variety
        let bestMove = possibleMoves[0];
        let bestScore = -Infinity;
        let bestMoves: typeof possibleMoves = [];

        possibleMoves.forEach(move => {
          const gameCopy = new Chess(game.fen());
          gameCopy.move(move);
          // Adjust score based on bot's color
          const score = botColor === 'b' ? evaluatePosition(gameCopy.board()) : -evaluatePosition(gameCopy.board());
          
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [move];
          } 
          else if (score === bestScore) {
            bestMoves.push(move);
          }
        });

        // Choose a random move from the best moves
        bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        // Make the move
        const newGame = new Chess(game.fen());
        newGame.move(bestMove);
        setGame(newGame);
        
        // Update last move
        setLastMove({
          from: bestMove.from as Square,
          to: bestMove.to as Square
        });
        
        // Check if game is over after bot's move
        checkGameOver(newGame);
        setIsThinking(false);
      } catch (error) {
        console.error('Error making bot move:', error);
        setIsThinking(false);
      }
    }, 500);
  }, [game, gameOver, playerColor]);

  // Effect to trigger bot's move
  useEffect(() => {
    // Only make moves after the initial setup is complete
    if (game.turn() !== playerColor && !gameOver && playerColor !== null && !isThinking) {
      // Don't make a move if we're still in the starting position and player is black
      if (playerColor === 'b' && game.fen() === new Chess().fen()) {
        return;
      }
      makeBotMove();
    }
  }, [game, makeBotMove, gameOver, playerColor, isThinking]);

  // Handle player move
  const handleMove = (from: string, to: string): boolean => {
    if (isThinking || gameOver || game.turn() !== playerColor) return false;

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
      
      // Check if game is over after player's move
      if (!checkGameOver(newGame)) {
        // Bot will move automatically due to useEffect
        return true;
      }
      
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
    setIsThinking(false);
    setSelectedPiece(null);
    setLastMove(null);
    setPlayerColor(null);
  };

  // Start game with selected color
  const startGame = (color: 'w' | 'b') => {
    const newGame = new Chess();
    setPlayerColor(color);
    setGame(newGame);
    
    // If player chose black, make bot's first move as white
    if (color === 'b') {
      setIsThinking(true);
      setTimeout(() => {
        try {
          // Make a single move as white
          const possibleMoves = newGame.moves({ verbose: true });
          // For first move, prefer center pawns and knights
          const goodFirstMoves = possibleMoves.filter(
            move => (move.piece === 'p' && (move.from === 'e2' || move.from === 'd2')) ||
                    (move.piece === 'n' && (move.to === 'f3' || move.to === 'c3'))
          );
          const movePool = goodFirstMoves.length > 0 ? goodFirstMoves : possibleMoves;
          const move = movePool[Math.floor(Math.random() * movePool.length)];
          
          // Make the move and update game state
          newGame.move(move);
          setGame(new Chess(newGame.fen()));
          setLastMove({
            from: move.from as Square,
            to: move.to as Square
          });
          setIsThinking(false);
        } catch (error) {
          console.error('Error making first move:', error);
          setIsThinking(false);
        }
      }, 500);
    }
  };

  // Color selection screen
  if (!playerColor) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center space-y-6 py-12">
          <h3 className="text-2xl font-bold text-white">Choose Your Color</h3>
          <div className="flex justify-center gap-8">
            <button
              onClick={() => startGame('w')}
              className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              <div className="w-24 h-24">
                <Chessboard
                  position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                  boardOrientation="white"
                  customBoardStyle={{
                    borderRadius: '4px',
                  }}
                />
              </div>
              <span className="text-black font-semibold">Play as White</span>
            </button>
            <button
              onClick={() => startGame('b')}
              className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              <div className="w-24 h-24">
                <Chessboard
                  position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                  boardOrientation="black"
                  customBoardStyle={{
                    borderRadius: '4px',
                  }}
                />
              </div>
              <span className="text-black font-semibold">Play as Black</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users w-6 h-6">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Pass and Play
          </button>
        </div>
      </div>
    );
  }

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
            <h3 className="text-xl font-semibold mb-2 text-white">Play Against Bot</h3>
            <p className="text-sm text-gray-200">Challenge yourself against our chess bot!</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Game Status</h4>
              <p className="text-sm text-gray-300">
                {isThinking 
                  ? "Bot is thinking..." 
                  : game.turn() === playerColor
                  ? `Your turn (${playerColor === 'w' ? 'White' : 'Black'})`
                  : "Bot's turn"
                }
                {game.isCheck() ? " - Check!" : ""}
              </p>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-base font-medium mb-1 text-white">Current Turn</h4>
              <p className="text-sm text-gray-300">
                {isThinking 
                  ? "Bot is analyzing the position..."
                  : game.turn() === playerColor
                  ? "Your turn - make a move!"
                  : "Bot is thinking..."
                }
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
              boardOrientation={playerColor === 'w' ? 'white' : 'black'}
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