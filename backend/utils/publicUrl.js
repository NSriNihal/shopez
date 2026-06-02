export const getRequestBaseUrl = (req) => {
    const configuredBase = process.env.PUBLIC_BASE_URL
    if (configuredBase) {
        return configuredBase.replace(/\/$/, "")
    }

    const host = req.get("host")
    const forwardedProto = req.headers["x-forwarded-proto"]
    const protocol = forwardedProto
        ? forwardedProto.split(",")[0].trim()
        : req.protocol

    return `${protocol}://${host}`.replace(/\/$/, "")
}

export const normalizeAssetUrl = (value, req) => {
    if (!value || typeof value !== "string") {
        return value
    }

    const baseUrl = getRequestBaseUrl(req)

    // Convert stored localhost asset URLs to the current public backend origin.
    if (value.startsWith("http://localhost:8000") || value.startsWith("https://localhost:8000")) {
        const pathname = value.replace(/^https?:\/\/localhost:8000/, "")
        return `${baseUrl}${pathname.startsWith("/") ? "" : "/"}${pathname}`
    }

    if (value.startsWith("/uploads/")) {
        return `${baseUrl}${value}`
    }

    return value
}
