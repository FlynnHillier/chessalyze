import React,{useState} from 'react'

import { socket } from '../contexts/socket.context'
import axios from 'axios'

const Status = () => {
    let [gameID,setGameID] = useState<string>("null")
    let [lobbyID,setLobbyID] = useState<string>("null")
    let [input,setInput] = useState<string>("")


    async function createLobby(){
        try {
            const result = await axios.get("/a/game/lobby/create")
            setLobbyID(result.data.lobbyID)
        } catch(e){
            console.error(e)
        }
    }

    async function joinLobby(){
        try {
            const result = await axios.post("/a/game/lobby/join",{lobbyID:input})
            console.log(result.data)
        } catch(e){
            console.error(e)
        }
    }

    socket.on("game:joined",(gameID)=>{
        setGameID(gameID)
    })

    socket.on("lobby:ended",()=>{
        setLobbyID("null")
    })

    socket.on("lobby:joined",(lobbyID)=>{
        setLobbyID(lobbyID)
    })
  
  
    return (
        <>
                <div>GAMEID = {gameID}</div>
                <div>LobbyID = {lobbyID}</div>
                <button onClick={createLobby}>
                    create lobby
                </button>
                <input value={input} onInput={(e)=>{setInput((e.target as HTMLInputElement).value)}}></input>
                <button onClick={joinLobby}>join lobby</button>
        </>
  )
}

export default Status