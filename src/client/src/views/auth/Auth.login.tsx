import React,{useState} from 'react'
import axios from "axios"

const AuthLogin = () => {
  const [isLoading,setIsLoading] = useState<boolean>(false)
  const [username,setUsername] = useState<string>("")
  const [password,setPassword] = useState<string>("")
  const [message,setMessage] = useState<any>("")

  async function onSubmit(e:React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await axios.post(`/auth/v/login`,{
        username:username,
        password:password
      })
      console.log(result)
    } catch (err : any) {
      setMessage(err?.message)
    } finally {
      setIsLoading(false)
    }
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

      <text> {message} </text>
      <button disabled={isLoading}> Submit </button>
    </form>
  )
}

export default AuthLogin