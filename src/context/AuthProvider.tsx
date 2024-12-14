'use client'
import { SessionProvider } from "next-auth/react"

interface ChildrenProps {
    children: React.ReactNode
}

function AuthProvider({ children }: ChildrenProps) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

export default AuthProvider