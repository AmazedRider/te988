import React, { useState } from 'react';
import { Crown, Trophy, User, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { Profile } from './profile/Profile';
import { Leaderboard } from './leaderboard/Leaderboard';
import { ChessModal } from './chess/ChessModal';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const isDark = theme === 'dark';

  return (
    <>
      <header className={`${isDark ? 'bg-gray-800/95' : 'bg-white/95'} sticky top-0 z-50 backdrop-blur-sm shadow-lg transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <Crown className="h-8 w-8 text-primary drop-shadow-md" />
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Chess<span className="text-primary font-extrabold">.ad</span>
              </h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => setShowLeaderboard(true)}
                className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg
                  ${isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-100/80'
                  } transition-all duration-200`}
              >
                <Trophy className="h-5 w-5 mr-2" />
                <span>Leaderboard</span>
              </button>
              <button 
                onClick={() => setShowProfile(true)}
                className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg
                  ${isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-100/80'
                  } transition-all duration-200`}
              >
                <User className="h-5 w-5 mr-2" />
                <span>Profile</span>
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${
                  isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/80'
                } transition-all duration-200`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {showProfile && (
        <ChessModal onClose={() => setShowProfile(false)}>
          <Profile onClose={() => setShowProfile(false)} />
        </ChessModal>
      )}

      {showLeaderboard && (
        <ChessModal onClose={() => setShowLeaderboard(false)}>
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        </ChessModal>
      )}
    </>
  );
}