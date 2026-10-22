import React, { useEffect } from 'react';
import { ConsolePage } from './pages/ConsolePage';
import { useConsoleStore } from './store/useConsoleStore';

export const App: React.FC = () => {
  const { isDarkMode } = useConsoleStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <ConsolePage />;
};

export default App;
