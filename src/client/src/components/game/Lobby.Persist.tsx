import React,{useEffect} from 'react'
import { Spinner,Button } from 'react-bootstrap'
import "./../../styles/misc.css"
import {Container} from 'react-bootstrap'

import { usePersistLobby } from '../../hooks/usePersistLobby'


const LobbyPersist = () => {
    const {persistLobby,isLoading,errorMessage,clearErrorMessage} = usePersistLobby()

    useEffect(()=>{
        persistLobby()
    },[])
    

    function reAttemptPersist(){
        clearErrorMessage()
        persistLobby()
    }

    return (
        <Container fluid className="justify-content-center text-center">
            {
                isLoading
                ? <>
                    <Spinner className="spinner big m-5" animation="border" role="status"/>
                    <br/>
                    <h5>fetching lobby status..</h5>
                </>
                : <div style={{textAlign:"center"}}>
                    <p>unable to fetch lobby status</p>
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

export default LobbyPersist