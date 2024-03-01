import React,{useState} from 'react'
import Form from "./../../components/util/Form"
import { useSignup } from "../../hooks/auth/useSignup"

const AuthSignup = () => {
    const {signup,isLoading,errorMessage,clearErrorMessage} = useSignup()
    
    const [username,setUsername] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    
  
  
    return (
        <Form
            title={"signup"}
            isLoading={isLoading}
            onSubmit={()=>{
                signup(username,password)
            }}
            errorState={{
                value:errorMessage,
                clear:clearErrorMessage
            }}
            submitButtonText={"signup"}
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

export default AuthSignup