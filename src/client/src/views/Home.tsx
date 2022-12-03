import React from 'react'
import Name from '../components/user/Name'
import Status from '../components/Status'
import AuthLogin from '../components/auth/Auth.Login'
import AuthLogout from '../components/auth/Auth.logout'
import AuthSignup from '../components/auth/Auth.Signup'
import TempLoadGame from '../components/TempLoadGame'


const Home = () => {
  return (
    <>
        <div>Home</div>
        <Name/>
        <Status/>
        <AuthSignup/>
        <AuthLogout/>
        <TempLoadGame/>
    </>
  )
}

export default Home