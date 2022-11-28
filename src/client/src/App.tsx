import React from 'react';
import logo from './logo.svg';

import SocketProvider from './contexts/socket.context';
import AuthLogin from './views/auth/Auth.login';
import Name from './components/user/Name';
import Status from './components/Status';
import ChessInterface from './views/ChessInterface';

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <ChessInterface/>
        <AuthLogin/>
        <Name/>
        <Status/>
      </SocketProvider>
    </div>
  );
}

export default App;
