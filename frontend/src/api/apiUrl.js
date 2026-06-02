const rawApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""

export const apiUrl = (path) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`

    if (!rawApiUrl) {
        return normalizedPath
    }

    const baseUrl = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`

    return `${baseUrl}${normalizedPath}`
}