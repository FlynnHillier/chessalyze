import React from 'react'
import {Routes,Route} from "react-router-dom"
import ChessInterface from '../views/ChessInterface'
import Home from '../views/Home'

const IndexRoute = () => {
  return (
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/game" element={<ChessInterface/>}/>
    </Routes>
  )
}

export default IndexRoute