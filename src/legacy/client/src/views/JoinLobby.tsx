import React,{useEffect} from 'react'
import {Container,Spinner,Button} from "react-bootstrap"
import { useParams,useNavigate } from 'react-router-dom'
import { useJoinLobby } from '../hooks/lobby/useJoinLobby'

const JoinLobby = () => {
  const {lobbyID} = useParams()
  const {joinLobby,isLoading,error} = useJoinLobby()
  const navigate = useNavigate()

  useEffect(()=>{
    if(typeof lobbyID !== "string"){
      navigate("/game")
    } else{
      joinLobby({lobby:{
        id:lobbyID
      }})
    }
  },[])
  
  
  return (
    <Container fluid className="justify-content-center text-center">
            {
                isLoading
                ? 
                <>
                  <Spinner className="spinner big m-5" animation="border" role="status"/>
                  <br/>
                  <h5>joining lobby {lobbyID}</h5>
                </>
                : 
                <div style={{textAlign:"center"}}>
                  <p>unable to join lobby: '{`${lobbyID}`}'</p>
                  <p> reason: '{error?.message ?? 'unknown'}'</p>
                </div>
            }
      </Container>
  )
}

export default JoinLobby