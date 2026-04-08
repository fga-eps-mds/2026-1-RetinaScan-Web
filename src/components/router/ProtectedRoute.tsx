import type { JSX } from 'react'
import { Navigate } from 'react-router'

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // substituir por autenticação
  if (true) {
    // Se não estiver logado, manda para o login
    return <Navigate to="/login" replace />
  }
  return children
}
