import React from 'react'
import {Routes,Route} from "react-router-dom"
import ChessInterface from '../components/game/ChessInterface'
import Home from '../views/Home'
import { Login } from '../views/Login'
import RequireAuthController from './controllers/RequireAuth.Controller'
import PersistedAuthController from './controllers/PersistAuth.Controller'
import PersistedGameController from './controllers/PersistGame.controller'
import PersistedLobbyController from './controllers/PersistLobby.controller'
import Game from '../views/Game'

const IndexRoute = () => {
  return (
    <Routes>
        <Route element={<PersistedAuthController/>}>
          <Route element={<RequireAuthController/>}>
            <Route path="/game" element={<PersistedGameController/>}>
              <Route element={<PersistedLobbyController/>}>
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