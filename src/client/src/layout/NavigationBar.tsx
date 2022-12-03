import React from 'react'
import "./../styles/layout/navigationBar.css"
import { Navbar,Nav,Container } from 'react-bootstrap'
import {NavLink} from "react-router-dom"


export interface NavOption {
  to:string,
  text:string,
}

const NavigationBar = () => {
  
  const navOptions : NavOption[] = [
    {
      to:"/home",
      text:"home"
    },
    {
      to:"/game",
      text:"game"
    }
  ]

  return (
    <Navbar sticky='top' className="top-nav-bar">
      <Container className="justify-content-center gap-3 ">
        {navOptions.map((navOption)=>{
            return (
              <Nav.Link
                className="link"
                as={NavLink}
                to={navOption.to} 
              >
                {navOption.text}
              </Nav.Link>
            )
        })}
      </Container>
    </Navbar>
  )
}

export default NavigationBar