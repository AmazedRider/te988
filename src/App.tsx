import { useEffect } from 'react';
import { AuthGuard } from './components/auth/AuthGuard';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { useSupabaseSession } from './lib/hooks/useSupabaseSession';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

function App() {
  const theme = useThemeStore((state) => state.theme);
  
  // Initialize Supabase session
  useSupabaseSession();

  return (
    <AuthGuard>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <Dashboard />
      </div>
    </AuthGuard>
  );
}

export default App;