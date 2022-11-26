import React from 'react';
import logo from './logo.svg';

import SocketProvider from './contexts/socket.context';

import ChessGame from './views/ChessGame';
import AuthLogin from './views/auth/Auth.login';
import Name from './components/user/Name';

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <ChessGame/>
        <AuthLogin/>
        <Name/>
      </SocketProvider>
    </div>
  );
}

export default App;
