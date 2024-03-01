import {useEffect, useState} from "react"
import { UUID } from "@common/src/types/misc"
import { useGame } from "../../contexts/game.ctx"
import { trpc } from "../../util/trpc"

export const useJoinLobby = () => {
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

    const joinLobby = ({lobby} : {
        lobby:{
            id:UUID
        }
    }) => {
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