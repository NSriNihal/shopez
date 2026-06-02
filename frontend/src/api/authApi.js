import { apiUrl } from "./apiUrl"

const USER_STORAGE_KEY = "user"
const TOKEN_STORAGE_KEY = "token"

export const getStoredAuthSession = () => {
    if (typeof window === "undefined") {
        return { user: null, token: "" }
    }

    let user = null
    let token = ""

    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)
        user = storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
        user = null
    }

    try {
        token = localStorage.getItem(TOKEN_STORAGE_KEY) || ""
    } catch (error) {
        token = ""
    }

    return { user, token }
}

export const saveAuthSession = (user, token) => {
    if (typeof window === "undefined") {
        return
    }

    if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }

    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }
}

export const clearAuthSession = () => {
    if (typeof window === "undefined") {
        return
    }

    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export const buildAuthHeaders = (token, headers = {}) => {
    if (!token) {
        return { ...headers }
    }

    return {
        ...headers,
        Authorization: `Bearer ${token}`
    }
}

export const requestJson = async (path, { token, headers, ...options } = {}) => {
    const response = await fetch(apiUrl(path), {
        credentials: "include",
        ...options,
        headers: buildAuthHeaders(token, headers)
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        const error = new Error(data.message || "Request failed")
        error.status = response.status
        error.data = data
        throw error
    }

    return data
}

export const fetchCurrentUser = async (token) => {
    if (!token) {
        return null
    }

    return requestJson("/user/current", { token })
}

export const signOutRequest = async (token) => {
    try {
        await requestJson("/auth/signout", {
            method: "POST",
            token
        })
    } catch (error) {
        return null
    }

    return null
}
