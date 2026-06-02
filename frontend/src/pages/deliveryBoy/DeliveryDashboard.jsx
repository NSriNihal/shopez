import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

function DeliveryDashboard() {
    const [profile, setProfile] = useState(null)
    const [earnings, setEarnings] = useState(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [updatingLocation, setUpdatingLocation] = useState(false)

    const fetchData = async () => {
        try {
            const [profileRes, earningsRes] = await Promise.all([
                fetch(apiUrl("/delivery-boy/profile"), {
                    credentials: "include"
                }),
                fetch(apiUrl("/delivery-boy/earnings"), {
                    credentials: "include"
                })
            ])

            const profileData = await profileRes.json()
            const earningsData = await earningsRes.json()

            if (profileRes.ok) {
                setProfile(profileData)
            } else {
                setMessage(profileData.message || "Failed to fetch profile")
            }

            if (earningsRes.ok) {
                setEarnings(earningsData)
            }
        } catch (error) {
            setMessage("Server error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const updateAvailability = async (isAvailable) => {
        try {
            const res = await fetch(
                apiUrl("/delivery-boy/availability"),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ isAvailable })
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to update availability")
                return
            }

            setMessage(data.message)
            fetchData()
        } catch (error) {
            setMessage("Server error")
        }
    }

    const updateCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMessage("Geolocation is not supported")
            return
        }

        setUpdatingLocation(true)
        setMessage("Detecting current location...")

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await fetch(
                        apiUrl("/delivery-boy/location"),
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            })
                        }
                    )

                    const data = await res.json()

                    if (!res.ok) {
                        setMessage(data.message || "Failed to update location")
                        return
                    }

                    setMessage(data.message || "Location updated successfully")
                    fetchData()
                } catch (error) {
                    setMessage("Server error")
                } finally {
                    setUpdatingLocation(false)
                }
            },
            () => {
                setMessage("Unable to detect location")
                setUpdatingLocation(false)
            }
        )
    }

    if (loading) {
        return (
            <MainLayout>
                <p className="text-gray-600">Loading delivery dashboard...</p>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Delivery Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage availability, location, orders, and earnings.
                </p>
            </div>

            {message && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Availability</p>
                    <h2
                        className={`text-2xl font-semibold mt-2 ${
                            profile?.isAvailable ? "text-emerald-600" : "text-red-600"
                        }`}
                    >
                        {profile?.isAvailable ? "Available" : "Unavailable"}
                    </h2>

                    <button
                        onClick={() => updateAvailability(!profile?.isAvailable)}
                        className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        {profile?.isAvailable ? "Go Offline" : "Go Online"}
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <h2 className="text-2xl font-semibold mt-2">
                        ₹{earnings?.totalEarnings || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Deliveries</p>
                    <h2 className="text-2xl font-semibold mt-2">
                        {earnings?.totalDeliveries || 0}
                    </h2>
                </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    Live Location
                </h2>

                {profile?.liveLocation?.latitude ? (
                    <p className="text-sm text-gray-600 mt-2">
                        {profile.liveLocation.latitude}, {profile.liveLocation.longitude}
                    </p>
                ) : (
                    <p className="text-sm text-gray-500 mt-2">
                        Location not updated yet.
                    </p>
                )}

                <button
                    onClick={updateCurrentLocation}
                    disabled={updatingLocation}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updatingLocation ? "Updating..." : "Update Current Location"}
                </button>
            </div>
        </MainLayout>
    )
}

export default DeliveryDashboard