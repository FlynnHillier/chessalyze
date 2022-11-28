import React,{useState} from 'react'
import { useLogin } from '../../hooks/useLogin'

const AuthLogin = () => {
    const {error,isLoading,login,} = useLogin()

    const [username,setUsername] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    



    async function onSubmit(e:React.FormEvent) {
        e.preventDefault()
        login(username,password)
    }
    
    
    return (
        <form
        onSubmit={onSubmit}
        >
        <h1>
            login
        </h1>
        <label>
            username:
        </label>
        <input value={username} onInput={(e)=>{setUsername((e.target as HTMLInputElement).value)}}></input>
        <label>
            password:
        </label>
        <input value={password} onInput={(e)=>{setPassword((e.target as HTMLInputElement).value)}}></input>
    
        <text> {error ? `error: ${error.message ? error.message : "an unexpected error occured"}` : ""} </text>
        <button disabled={isLoading}> Submit </button>
        </form>
    )
}

export default AuthLogin