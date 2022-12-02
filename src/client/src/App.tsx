import React from 'react';
import logo from './logo.svg';

import AuthProvider from './contexts/auth.context';
import SocketProvider from './contexts/socket.context';
import Name from './components/user/Name';
import Status from './components/Status';
import ChessInterface from './views/ChessInterface';
import AuthLogin from './components/auth/Auth.Login';
import AuthSignup from './components/auth/Auth.Signup';
import AuthLogout from './components/auth/Auth.logout';
import GameProvider from './contexts/game.context';
import TempLoadGame from './components/TempLoadGame';

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <AuthProvider>
          <GameProvider>
            <ChessInterface/>
            <AuthLogin/>
            <Name/>
            <Status/>
            <AuthSignup/>
            <AuthLogout/>
            <TempLoadGame/>
          </GameProvider>
        </AuthProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
