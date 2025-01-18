import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { chessOpenings } from '../../data/openings';
import type { ChessOpening } from './types/opening';

interface OpeningsSelectionProps {
  onSelectOpening: (opening: ChessOpening) => void;
  completedOpenings: Set<string>;
}

export function OpeningsSelection({ onSelectOpening, completedOpenings }: OpeningsSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Chess Openings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chessOpenings.map((opening) => (
          <div
            key={opening.id}
            className={`chess-card ${
              completedOpenings.has(opening.id) ? 'bg-green-50/10' : 'bg-white/5'
            } backdrop-blur-sm`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${
                completedOpenings.has(opening.id) ? 'bg-green-500/20' : 'bg-white/10'
              }`}>
                <Crown className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-white">{opening.name}</h3>
                <p className="text-sm text-gray-300 mb-4">{opening.description}</p>
                <button
                  onClick={() => onSelectOpening(opening)}
                  className="flex items-center gap-2 text-sm text-white hover:text-primary/80"
                >
                  {completedOpenings.has(opening.id) ? 'Practice Again' : 'Start Learning'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}