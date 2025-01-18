import { RotateCcw, Flag } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onResign?: () => void;
  currentTurn: 'white' | 'black';
}

export function GameControls({ onReset, onResign, currentTurn }: GameControlsProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
      <div className="text-white font-medium">
        Current Turn: {currentTurn === 'white' ? 'White' : 'Black'}
      </div>
      
      <div className="space-x-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
        >
          <RotateCcw className="w-5 h-5" />
          Reset Game
        </button>
        
        {onResign && (
          <button
            onClick={onResign}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-opacity-90"
          >
            <Flag className="w-5 h-5" />
            Resign
          </button>
        )}
      </div>
    </div>
  );
}