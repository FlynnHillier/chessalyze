import React from 'react'
import AuthLogout from '../components/auth/Auth.logout'
import AuthSignup from '../components/auth/Auth.Signup'
import TestTRPC from '../components/test/TestTRPC'


const Home = () => {
  return (
    <>
        <TestTRPC/>
        <AuthSignup/>
        <AuthLogout/>
    </>
  )
}

export default Home