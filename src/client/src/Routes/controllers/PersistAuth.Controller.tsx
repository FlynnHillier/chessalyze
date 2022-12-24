import React from 'react'
import { Outlet } from 'react-router-dom'
import AuthPersist from '../../components/auth/Auth.Persist'

import { useAuth } from '../../hooks/contexts/useAuth'

const PersistedAuthController = () => {
  const {auth} = useAuth()
  
  return (
    auth.hasPersisted
      ? <Outlet/>
      : <AuthPersist/>
  )
}

export default PersistedAuthController