import { BookOpen, Sword, Target, Trophy } from 'lucide-react';

export const lessons = [
  {
    id: 1,
    title: "Basic Moves",
    description: "Learn how each piece moves on the board",
    icon: Sword,
    completed: true,
  },
  {
    id: 2,
    title: "Opening Principles",
    description: "Master the fundamentals of chess openings",
    icon: BookOpen,
    completed: false,
  },
  {
    id: 3,
    title: "Basic Tactics",
    description: "Discover key tactical patterns",
    icon: Target,
    completed: false,
  },
  {
    id: 4,
    title: "Endgame Essentials",
    description: "Learn crucial endgame techniques",
    icon: Trophy,
    completed: false,
  },
] as const;