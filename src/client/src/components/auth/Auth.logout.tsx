import React,{useEffect} from 'react'
import { Button } from 'react-bootstrap'
import { useLogout } from '../../hooks/useLogout'

const AuthLogout = () => {
    const {isLoading,errorMessage,clearErrorMessage,logout} = useLogout()

    useEffect(()=>{
        if(errorMessage !== ""){
            console.log(errorMessage)
            clearErrorMessage()
        }
    },[errorMessage])

    return (
        <Button
            onClick={logout}
            disabled={isLoading}
        >
            logout
        </Button>
    )
}

export default AuthLogout