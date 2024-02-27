import React from 'react'
import {Routes,Route} from "react-router-dom"
import ChessInterface from '../components/game/ChessInterface'
import Home from '../views/Home'
import { Login } from '../views/Login'
import RequireAuthController from './controllers/RequireAuth.Controller'
import PersistedAuthController from './controllers/PersistAuth.Controller'
import Game from '../views/Game'
import JoinLobby from '../views/JoinLobby'

const IndexRoute = () => {
  return (
    <Routes>
        <Route element={<PersistedAuthController/>}>
          <Route element={<RequireAuthController/>}>
            <Route path="/game">
              <Route>
                <Route path="/game/join/:lobbyID" element={<JoinLobby/>}/>
                <Route path="/game/" element={<Game/>}/>
              </Route>
            </Route>
          </Route>
          <Route path="/home" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
        </Route>
    </Routes>
  )
}

export default IndexRoute