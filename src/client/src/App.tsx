import React from 'react';
import logo from './logo.svg';

import SocketProvider from './contexts/socket.context';

import ChessGame from './views/ChessGame';

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <ChessGame/>
      </SocketProvider>
    </div>
  );
}

export default App;
