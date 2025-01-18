import React from 'react';
import { Info } from 'lucide-react';

export function GameInstructions() {
  return (
    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm space-y-2">
      <div className="flex items-center gap-2 text-white">
        <Info className="w-5 h-5" />
        <h3 className="font-semibold">How to Play</h3>
      </div>
      
      <ul className="text-gray-200 space-y-1 text-sm">
        <li>• Click on a piece to select it</li>
        <li>• Green highlights show valid moves</li>
        <li>• Red highlights show possible captures</li>
        <li>• Click a highlighted square to move</li>
        <li>• Yellow highlight shows the selected piece</li>
      </ul>
    </div>
  );
}