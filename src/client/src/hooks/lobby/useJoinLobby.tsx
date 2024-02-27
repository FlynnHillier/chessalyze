import {useEffect, useState} from "react"
import { UUID } from "@common/src/types/misc"
import { useGame } from "../../contexts/game.ctx"
import { trpc } from "../../util/trpc"

export const useJoinLobby = ({lobby} : {
    lobby:{
        id:UUID
    }
}) => {
    const mutation = trpc.a.lobby.join.useMutation()
    const {dispatchGame} = useGame()

    useEffect(()=>{
        if (mutation.isSuccess)
        {
            dispatchGame({
                type:"LOAD",
                payload:{
                    present:true,
                    game:mutation.data.game
                }
            })
        }
    },[mutation.isLoading])

    const joinLobby = () => {
        if (mutation.isIdle)
            mutation.mutate({
                lobby:{
                    id:lobby.id
                }
            })
    }

    return {
        joinLobby,
        isLoading:mutation.isLoading,
        error:mutation.error,
    }
}