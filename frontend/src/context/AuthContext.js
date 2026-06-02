import { createContext, createElement, useCallback, useContext, useEffect, useState } from "react"
import { clearAuthSession, fetchCurrentUser, getStoredAuthSession, saveAuthSession, signOutRequest } from "../api/authApi"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(true)

    const syncSession = useCallback((nextUser, nextToken) => {
        setUser(nextUser)
        setToken(nextToken || "")

        if (nextUser && nextToken) {
            saveAuthSession(nextUser, nextToken)
            return
        }

        clearAuthSession()
    }, [])

    const login = useCallback((nextUser, nextToken) => {
        syncSession(nextUser, nextToken)
    }, [syncSession])

    const logout = useCallback(async () => {
        const currentToken = token
        syncSession(null, "")

        if (currentToken) {
            await signOutRequest(currentToken)
        }
    }, [syncSession, token])

    const refreshUser = useCallback(async () => {
        if (!token) {
            setUser(null)
            return null
        }

        try {
            const currentUser = await fetchCurrentUser(token)
            setUser(currentUser)
            saveAuthSession(currentUser, token)
            return currentUser
        } catch (error) {
            syncSession(null, "")
            return null
        }
    }, [syncSession, token])

    useEffect(() => {
        const initializeAuth = async () => {
            const storedSession = getStoredAuthSession()

            if (!storedSession.token) {
                setLoading(false)
                return
            }

            if (storedSession.user) {
                setUser(storedSession.user)
            }

            setToken(storedSession.token)

            try {
                const currentUser = await fetchCurrentUser(storedSession.token)
                setUser(currentUser)
                saveAuthSession(currentUser, storedSession.token)
            } catch (error) {
                clearAuthSession()
                setUser(null)
                setToken("")
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    return createElement(
        AuthContext.Provider,
        {
            value: {
                user,
                token,
                loading,
                login,
                logout,
                refreshUser
            }
        },
        children
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context
}
