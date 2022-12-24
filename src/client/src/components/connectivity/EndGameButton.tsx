import FancyButton from "../util/FancyButton"

const EndGameButton = () => {
    function onClick(){
        console.log("!end game here!")
    }

    return (
        <FancyButton
            text={"end game"}
            isLoading={false}
            onClick={onClick}
        />
  )
}

export default EndGameButton