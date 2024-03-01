import React from 'react'
import AuthLogout from '../components/auth/Auth.logout'
import AuthSignup from '../components/auth/Auth.Signup'


const Home = () => {
  return (
    <>
        <AuthSignup/>
        <AuthLogout/>
    </>
  )
}

export default Home