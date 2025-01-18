import React, { useState } from 'react';
import { DailyProgress } from './DailyProgress';
import { LearningPath } from './LearningPath';
import { ChessBot } from './chess/ChessBot';
import { ChessPassAndPlay } from './chess/ChessPassAndPlay';
import { ChessModal } from './chess/ChessModal';
import { Bot, Users } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

export function Dashboard() {
  const [showBot, setShowBot] = useState(false);
  const [showPassAndPlay, setShowPassAndPlay] = useState(false);
  const theme = useThemeStore(state => state.theme);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <DailyProgress />
            <LearningPath />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Challenge
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowBot(true)}
                className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-all duration-200`}
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">Play with Bot</span>
              </button>
              <button
                onClick={() => setShowPassAndPlay(true)}
                className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } transition-all duration-200`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Pass and Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBot && (
        <ChessModal onClose={() => setShowBot(false)}>
          <ChessBot onClose={() => setShowBot(false)} />
        </ChessModal>
      )}

      {showPassAndPlay && (
        <ChessModal onClose={() => setShowPassAndPlay(false)}>
          <ChessPassAndPlay onClose={() => setShowPassAndPlay(false)} />
        </ChessModal>
      )}
    </div>
  );
}