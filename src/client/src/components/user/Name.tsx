import React,{useState} from 'react'
import axios from "axios"
import {socket} from '../../contexts/socket.context'

const Name = ({}) => {
    
    let [name,setName] = useState<string>("")
    let [isLoading,setIsLoading] = useState<boolean>(false)

    async function getName(){
        setIsLoading(true)
        try {
            const name = await axios.get(`/a/u/name`)
            setName(name.data.user || "!!noName!!")
        }catch(err){
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }
  
  
    return (
    <div>
        {name}
        <button disabled={isLoading} onClick={getName}>
            reload
        </button>
    </div>
  )
}

export default Name