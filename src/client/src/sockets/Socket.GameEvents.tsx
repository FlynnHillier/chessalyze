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
        const handleGameMovement = (gameID:UUID,{sourceSquare,targetSquare,promotion,time} : {sourceSquare:Square,targetSquare:Square,promotion?:PromotionSymbol,time?:{w:number,b:number}})=>{
            dispatchGameStatus({
                type:"MOVE",
                payload:{
                    moveDetails:{
                        sourceSquare,
                        targetSquare,
                        promotion
                    },
                    time:time
                }
            })
        }
    
        const handleGameJoined = (gameDetails:any)=>{
            dispatchGameStatus({
                type:"JOIN",
                payload:{
                    gameDetails:{
                        players:gameDetails.players,
                        captured:gameDetails.captured,
                        colour:gameDetails.colours[auth.userInfo.id],
                        fen:gameDetails.fen
                    },
                    time:gameDetails.time.isTimed ? gameDetails.time.durations : undefined
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