import React from 'react';
import logo from './logo.svg';

import AuthProvider from './contexts/auth.context';
import SocketProvider from './contexts/socket.context';
import Name from './components/user/Name';
import Status from './components/Status';
import ChessInterface from './views/ChessInterface';
import AuthLogin from './components/auth/Auth.Login';


function App() {
  return (
    <div className="App">
      <SocketProvider>
        <AuthProvider>
          <ChessInterface/>
          <AuthLogin/>
          <Name/>
          <Status/>
        </AuthProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
