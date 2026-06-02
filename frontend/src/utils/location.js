export const resolveCurrentAddress = async ({ latitude, longitude }) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        const res = await fetch(url)
        const data = await res.json()

        return data.display_name || data.address?.road || data.address?.suburb || "Current Location"
    } catch (error) {
        return "Current Location"
    }
}