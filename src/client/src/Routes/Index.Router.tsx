import React from 'react'
import {Routes,Route} from "react-router-dom"
import ChessInterface from '../views/ChessInterface'
import Home from '../views/Home'
import { Login } from '../views/Login'
import RequireAuthController from './controllers/RequireAuth.Controller'

const IndexRoute = () => {
  return (
    <Routes>
        <Route element={<RequireAuthController/>}>
          <Route path="/game" element={<ChessInterface/>}/>
        </Route>
        <Route path="/home" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
    </Routes>
  )
}

export default IndexRoute