import React, { useEffect, useState } from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import supabase from '../../utils/supabase';

interface LeaderboardProps {
  onClose: () => void;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  email: string;
  xp: number;
  rank?: number;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, email, xp')
          .order('xp', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Add rank to each user
        const usersWithRank = data.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        setUsers(usersWithRank);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-md" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-300 drop-shadow-md" />;
      case 3:
        return <Medal className="w-7 h-7 text-amber-700 drop-shadow-md" />;
      default:
        return <span className="w-7 h-7 flex items-center justify-center font-bold text-gray-400">{rank}</span>;
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white/10 rounded-xl backdrop-blur-md p-8 shadow-2xl border border-white/10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-white text-lg animate-pulse">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/10 rounded-xl backdrop-blur-md p-8 shadow-2xl border border-white/10">
      <div className="space-y-8">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-primary/20 rounded-xl shadow-inner">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
            <p className="text-gray-300 mt-1">Top 10 Players</p>
          </div>
        </div>

        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg backdrop-blur-sm transition-all duration-300
                ${index === 0 ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20' :
                  index === 1 ? 'bg-gray-300/10 hover:bg-gray-300/20 border border-gray-300/20' :
                  index === 2 ? 'bg-amber-700/10 hover:bg-amber-700/20 border border-amber-700/20' :
                  'bg-white/5 hover:bg-white/10 border border-white/10'}`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-none w-12 flex justify-center">
                  {getRankIcon(user.rank!)}
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">{user.username || 'Anonymous'}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{user.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-primary">{user.xp.toLocaleString()} XP</div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
              <p className="text-gray-400 text-lg">No players yet. Start learning to appear on the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}