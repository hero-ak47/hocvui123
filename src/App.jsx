// src/App.jsx
import { useState } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MainMenu from './components/Menu/MainMenu';
import NumberLearning from './components/Learning/NumberLearning';
import MathRaceGame from './components/MathGame/MathRaceGame';
import HandMathGame from './components/HandMath/HandMathGame';
import Statistics from './components/Stats/Statistics';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    coins: 0,
    level: 1,
    avatar: '👦'
  });

  const handleLogin = (username) => {
    setUser(username);
    setUserData(prev => ({ ...prev, username }));
    setCurrentScreen('menu');
  };

  const handleRegister = (username) => {
    setUser(username);
    setUserData(prev => ({ ...prev, username, coins: 100 }));
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  const addCoins = (amount) => {
    setUserData(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  return (
    <div className="app">
      {currentScreen === 'login' && (
        <Login
          onLogin={handleLogin}
          onRegister={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'register' && (
        <Register
          onRegister={handleRegister}
          onBack={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'menu' && (
        <MainMenu
          userData={userData}
          onSelectScreen={setCurrentScreen}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'learning' && (
        <NumberLearning
          onBack={() => setCurrentScreen('menu')}
          addCoins={addCoins}
        />
      )}

      {currentScreen === 'mathRace' && (
        <MathRaceGame
          onBack={() => setCurrentScreen('menu')}
          addCoins={addCoins}
          userData={userData}
        />
      )}

      {currentScreen === 'handMath' && (
        <HandMathGame
          onBack={() => setCurrentScreen('menu')}
          addCoins={addCoins}
        />
      )}

      {currentScreen === 'stats' && (
        <Statistics
          onBack={() => setCurrentScreen('menu')}
          userData={userData}
        />
      )}
    </div>
  );
}

export default App;