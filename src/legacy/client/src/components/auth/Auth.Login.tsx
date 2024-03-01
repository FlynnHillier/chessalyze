import React,{useState} from 'react'
import { useLogin } from '../../hooks/auth/useLogin'
import Form from "../util/Form"

const AuthLogin = () => {
    const {errorMessage,isLoading,clearErrorMessage,login} = useLogin()

    const [username,setUsername] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    
    async function onSubmit(e:React.FormEvent) {
        e.preventDefault()
        login(username,password)
    }

    return (
        <Form
            title={"login"}
            isLoading={isLoading}
            onSubmit={()=>{
                login(username,password)
            }}
            errorState={{
                value:errorMessage,
                clear:clearErrorMessage
            }}
            submitButtonText={"login"}
            fields={[
                {
                    label:"username",
                    placeholder:"username",
                    type:"text",
                    state:{
                        set:setUsername,
                        value:username
                    },
                    required:true
                },
                {
                    label:"password",
                    placeholder:"password",
                    type:"password",
                    state:{
                        set:setPassword,
                        value:password
                    },
                    required:true
                }
            ]}
        />
    )
}

export default AuthLogin