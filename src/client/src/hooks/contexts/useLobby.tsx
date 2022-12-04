import {useContext} from "react"
import { LobbyContext } from "../../contexts/lobby.context"

export const useLobby = () => {
    return useContext(LobbyContext)
}