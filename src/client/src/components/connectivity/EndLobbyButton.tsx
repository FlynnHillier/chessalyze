import FancyButton from "../util/FancyButton"
import { useLeaveLobby } from '../../hooks/game/useLeaveLobby'

const EndLobbyButton = () => {
    const {isLoading,leaveLobby} = useLeaveLobby()


    function onClick(){
        leaveLobby()
    }

    return (
        <FancyButton
            text={"end lobby"}
            isLoading={isLoading}
            onClick={onClick}
        />
  )
}

export default EndLobbyButton