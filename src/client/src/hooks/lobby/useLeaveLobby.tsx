import {useEffect, useState} from "react"
import { useLobby } from "../../contexts/lobby.ctx"
import { trpc } from "../../util/trpc"


export const useLeaveLobby = () => {
    const mutation = trpc.a.lobby.leave.useMutation()
    const {dispatchLobby} = useLobby()

    useEffect(()=>{
        if (mutation.isSuccess)
        {
            dispatchLobby({
                type:"END",
                payload:{}
            })
        }
    },[mutation.isLoading])

    const leaveLobby = () => {
        if (mutation.isIdle)
            mutation.mutate()
    }

    return {
        leaveLobby,
        isLoading:mutation.isLoading,
        error:mutation.error,
    }
}