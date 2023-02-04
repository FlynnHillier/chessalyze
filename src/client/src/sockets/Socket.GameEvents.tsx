import React,{useEffect,useCallback} from 'react'
import { UUID,PromotionSymbol} from 'chessalyze-common'
import { GameConclusionReason } from '../types/chessboard'
import { Square } from 'react-chessboard'
import { useSocket } from '../hooks/contexts/useSocket'
import { useGame } from '../hooks/contexts/useGame'
import { useAuth } from '../hooks/contexts/useAuth'

interface Props {
    children?:React.ReactNode,
}


const SocketGameEvents = ({children} : Props) => {
    const {dispatchGameStatus} = useGame()
    const {auth} = useAuth()
    const socket = useSocket()

    useEffect(()=>{
        const handleGameMovement = (gameID:UUID,{sourceSquare,targetSquare,promotion} : {sourceSquare:Square,targetSquare:Square,promotion?:PromotionSymbol})=>{
            dispatchGameStatus({type:"MOVE",payload:{moveDetails:{sourceSquare,targetSquare,promotion}}})
        }
    
        const handleGameJoined = (gameDetails:any)=>{
            dispatchGameStatus({
                type:"JOIN",
                payload:{
                    gameDetails:{
                        players:gameDetails.players,
                        captured:gameDetails.captured,
                        colour:gameDetails.colours[auth.userInfo.id],
                        fen:gameDetails.fen,
                    }
                }
            })
        }
    
        const handleGameEnded = ({termination,victor} : {termination:GameConclusionReason,victor:null | "w" | "b"})=>{
            dispatchGameStatus({
                type:"END",
                payload:{
                    conclusion:{
                        type:victor === null ? "draw" : victor,
                        reason:termination
                    }
                }
            })
        }

        socket.on("game:movement",handleGameMovement)
        socket.on("game:joined",handleGameJoined)
        socket.on("game:ended",handleGameEnded)
        return () => {
            console.log("removing listeners!")
            socket.off("game:movement",handleGameMovement)
            socket.off("game:joined",handleGameJoined)
            socket.off("game:ended",handleGameEnded)
        }
    },[socket,dispatchGameStatus,auth])



    return (
        <>
        {children}
        </>
    )
}

export default SocketGameEvents