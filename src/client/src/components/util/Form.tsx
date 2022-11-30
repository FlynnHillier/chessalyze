import React,{HTMLInputTypeAttribute,SetStateAction,Dispatch } from 'react'
import { useEffect } from 'react'
import {Container} from "react-bootstrap"
import "./../../styles/form.css"


interface Props {
    title?:string,
    fields:Field[]
    onSubmit:(...args : any[])=>any,
    errorState?:{
        clear:()=>void,
        value:string,
    },
    submitButtonText?:string,
    isLoading?:boolean,
}

interface Field {
    label:string,
    placeholder?:string,
    type:HTMLInputTypeAttribute,
    required:boolean,
    state:{
        value:string | number,
        set:Dispatch<SetStateAction<string>>
    }
}


const Form = ({title,fields,onSubmit,errorState,submitButtonText,isLoading} : Props) => {
    const fieldStateValues = fields.map((field)=>{return field.state.value })

    useEffect(()=>{
        if(errorState?.value !== ""){
            errorState?.clear()
        }
    },fieldStateValues)


  
  
    return (
        <Container
            className="px-3 py-2"
        >
            <div className="form title">
                <h2> {title} </h2>
            </div>
            <div className= "form error" hidden={errorState?.value === undefined || errorState.value === ""}>
                {`${errorState?.value}`}
            </div>

            <form
                onSubmit={(e:React.FormEvent)=>{
                    e.preventDefault()
                    onSubmit()
                }}
            >
                {fields.map((field)=>{
                    return(
                        <section className="form-group my-2" key={`formField_${fields.indexOf(field)}`}>
                            <label>
                                {field.label}
                            </label>
                            <input className="form-control"
                                placeholder={field.placeholder}
                                type={field.type}
                                value={field.state.value}
                                onInput={(e)=>field.state.set((e.target as HTMLInputElement).value)}
                                required={field.required}
                            >
                            </input>
                        </section>
                    )
                })}
                <div style={{display:"flex"}}  className="flex justify-content-center">
                    <button
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {submitButtonText}
                    </button>
                </div>
            </form>
        </Container>
  )
}

export default Form