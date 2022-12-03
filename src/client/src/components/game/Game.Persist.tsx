import React,{useEffect} from 'react'
import { usePersistGame } from '../../hooks/usePersistGame'
import { Spinner,Button } from 'react-bootstrap'
import "./../../styles/misc.css"
import {Container} from 'react-bootstrap'


const GamePersist = () => {
    const {persistGame,isLoading,errorMessage,clearErrorMessage} = usePersistGame()

    useEffect(()=>{
        persistGame()
    },[])
    

    function reAttemptPersist(){
        clearErrorMessage()
        persistGame()
    }

    return (
        <Container fluid className="justify-content-center text-center">
            {
                isLoading
                ? <>
                    <Spinner className="spinner big m-5" animation="border" role="status"/>
                    <br/>
                    <h5>fetching game status..</h5>
                </>
                : <div style={{textAlign:"center"}}>
                    <p>unable to fetch game status</p>
                    <p>reason: {errorMessage}</p>
                    <Button
                        variant="secondary"
                        onClick={reAttemptPersist}
                        disabled={isLoading}
                    >retry</Button>
                    </div>
            }
        </Container>
    )
}

export default GamePersist