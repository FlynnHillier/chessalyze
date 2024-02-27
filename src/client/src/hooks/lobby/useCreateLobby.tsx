import {useEffect, useState} from "react"
import { useLobby } from "../../contexts/lobby.ctx"
import { trpc } from "../../util/trpc"

export const useCreateLobby = () => {
    const mutation = trpc.a.lobby.create.useMutation()
    const { dispatchLobby } = useLobby()

    useEffect(()=>{
        if (mutation.isSuccess)
        {
            dispatchLobby({
                type:"START",
                payload:{
                    lobby:{
                        id:mutation.data.lobby.id
                    }
                }
            })
        }
    },[mutation.isLoading])

    const createLobby = () => {
        if (mutation.isIdle)
            mutation.mutate()
    }

    return {
        createLobby,
        isLoading:mutation.isLoading,
        error:mutation.error,
    }
}