import "../../styles/game/chessInterface.css"
import {useEffect, useState} from 'react'
import { Color, Chess } from 'chess.js'
import PlayerBanner from './PlayerBanner'
import ChessGame from './ChessGame'
import { useObserveElementWidth } from '../../hooks/util/useObserveElementWidth'
import { useSocket } from '../../hooks/contexts/useSocket'
import { useAuth } from '../../hooks/contexts/useAuth'
import { useGame } from '../../contexts/game.ctx'


const ChessInterface = () => {
    const {auth} = useAuth()
    const {game} = useGame()
    const { width, ref } = useObserveElementWidth<HTMLDivElement>();
    const socket = useSocket()

    const [times,setTime] = useState<{w:number,b:number}>(game.game?.engine.clock ? game.game.engine.clock.getDurations() : {w:-1, b:-1})
    let [colourConfiguration,setColourConfiguration] = useState<{native:Color,opponent:Color}>({
        native:"w",
        opponent:"b"
    })

    useEffect(()=>{
        setColourConfiguration(() => {
            if (game.game && auth.isLoggedIn && game.game.players.b.id === auth.userInfo.id)
                return {
                    native:"b",
                    opponent:"w",
                }
            
            return {
                native:"w",
                opponent:"b",
            }
        })
    },[game.game])

    useEffect(()=>{
        game.game?.engine.clock?.clocks.w.setOnDurationChange((time)=>setTime((prev)=>{return {...prev, w:time}}))
        game.game?.engine.clock?.clocks.b.setOnDurationChange((time)=>setTime((prev)=>{return {...prev, b:time}}))

        //on component demount remove references to unloaded state (CHANGE HERE IF IMPLEMENT MULTIPLE CLOCKS, will override any post-loaded clocks)
        return () => {
            game.game?.engine.clock?.clocks.w.setOnDurationChange(()=>{})
            game.game?.engine.clock?.clocks.b.setOnDurationChange(()=>{})
        }
    },[])
  
    return (
        <div className="chess-interface-container"
            ref={ref}
        >
            <PlayerBanner
                colour={colourConfiguration.opponent}
                playerName={game.game?.players[colourConfiguration.opponent].displayName || ""}
                time={times ? times[colourConfiguration.opponent] : -1}
            />
            {/* <div className="chess-interface layout-content"> */}
                <ChessGame
                    allowMovement={!!game}
                    instance={game.game?.engine.instance ?? new Chess()}
                    perspective={colourConfiguration.native}
                    style={{
                        width:width
                    }}
                />
            {/* </div> */}
            <PlayerBanner
                colour={colourConfiguration.native}
                playerName={game.game?.players[colourConfiguration.native].displayName ?? ""}
                time={times ? times[colourConfiguration.native] : -1}
            />
        </div>
    )
}

export default ChessInterface