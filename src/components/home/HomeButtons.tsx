import React from 'react';
import { Bot, Users } from 'lucide-react';

interface HomeButtonsProps {
  onPlayBot: () => void;
  onPassAndPlay: () => void;
}

export function HomeButtons({ onPlayBot, onPassAndPlay }: HomeButtonsProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onPlayBot}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        <Bot className="w-6 h-6" />
        Play with Bot
      </button>
      
      <button
        onClick={onPassAndPlay}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg"
      >
        <Users className="w-6 h-6" />
        Pass and Play
      </button>
    </div>
  );
}