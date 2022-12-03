import React,{useEffect} from 'react'
import usePersistAuth from '../../hooks/auth/usePersistAuth'
import { Spinner,Button } from 'react-bootstrap'
import "./../../styles/misc.css"
import {Container} from 'react-bootstrap'


const AuthPersist = () => {
    const {persistAuth,isLoading,errorMessage,clearErrorMessage} = usePersistAuth()

    useEffect(()=>{
        persistAuth()
    },[])
    

    function reAttemptPersist(){
        clearErrorMessage()
        persistAuth()
    }

    return (
        <Container fluid className="justify-content-center text-center">
            {
                isLoading
                ? <>
                    <Spinner className="spinner big m-5" animation="border" role="status"/>
                    <br/>
                    <h5>fetching auth status..</h5>
                </>
                : <div style={{textAlign:"center"}}>
                    <p>unable to fetch user info</p>
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

export default  AuthPersist