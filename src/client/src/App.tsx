import React from 'react';

import AuthProvider from './contexts/auth.context';
import SocketProvider from './contexts/socket.context';
import GameProvider from './contexts/game.context';
import LobbyProvider from './contexts/lobby.context';

import IndexRoute from './Routes/Index.Router';
import NavigationBar from './layout/NavigationBar';

import { TRPCwrapper } from './wrappers/Trpc.Wrapper';

function App() {
  return (
    <div className="App">
      <TRPCwrapper>
        <SocketProvider>
          <AuthProvider>
            <LobbyProvider>
              <GameProvider>
                <NavigationBar/>
                <IndexRoute/>
              </GameProvider>
            </LobbyProvider>
          </AuthProvider>
        </SocketProvider>
      </TRPCwrapper>
    </div>
  );
}

export default App;
