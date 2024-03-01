import React from 'react'
import { useLocation,Navigate,Outlet } from 'react-router-dom'

import { useAuth } from '../../hooks/contexts/useAuth'



const RequireAuthController = () => {
  const {auth} = useAuth()
  const location = useLocation()
  
  return (
    auth.isLoggedIn
      ? <Outlet/>
      : <Navigate to="/login" state={{source:location}}/>
  )
}

export default RequireAuthController