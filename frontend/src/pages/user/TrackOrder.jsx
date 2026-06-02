import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"
import { resolveCurrentAddress } from "../../utils/location"

const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-blue-100 text-blue-700",
    assigned: "bg-purple-100 text-purple-700",
    dispatched: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700"
}

function TrackOrder() {
    const { orderId } = useParams()

    const [tracking, setTracking] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [message, setMessage] = useState("")

    const fetchTracking = async ({ isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true)
        }

        try {
            const [trackRes, historyRes] = await Promise.all([
                fetch(apiUrl(`/tracking/order/${orderId}`), {
                    credentials: "include"
                }),
                fetch(apiUrl(`/tracking/order/${orderId}/history`), {
                    credentials: "include"
                })
            ])

            const trackData = await trackRes.json()
            const historyData = await historyRes.json()

            if (!trackRes.ok) {
                setMessage(trackData.message || "Failed to fetch tracking")
                return
            }

            setTracking(trackData)

            if (historyRes.ok) {
                const locations = historyData.locations || []
                const enrichedLocations = await Promise.all(
                    locations.map(async (location) => {
                        const place =
                            location.place ||
                            location.address ||
                            (await resolveCurrentAddress({
                                latitude: location.latitude,
                                longitude: location.longitude
                            }))

                        return {
                            ...location,
                            place
                        }
                    })
                )

                setHistory(enrichedLocations)
            }
        } catch (error) {
            setMessage("Server error")
        } finally {
            if (isRefresh) {
                setRefreshing(false)
            } else {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchTracking()
    }, [orderId])

    if (loading) {
        return (
            <MainLayout>
                <p className="text-gray-600">Loading tracking...</p>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Track Order
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Order #{orderId.slice(-6).toUpperCase()}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => fetchTracking({ isRefresh: true })}
                        disabled={refreshing}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>

                    <Link
                        to="/my-orders"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                        My Orders
                    </Link>
                </div>
            </div>

            {message && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                    {message}
                </div>
            )}

            {tracking && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Delivery Status
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {tracking.store?.name}
                                    </p>
                                </div>

                                <span
                                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                                        statusStyles[tracking.status] ||
                                        "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {tracking.status}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500">
                                        Store Location
                                    </p>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {tracking.store?.location?.latitude},{" "}
                                        {tracking.store?.location?.longitude}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {tracking.store?.address}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500">
                                        Delivery Location
                                    </p>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {tracking.deliveryLocation?.latitude},{" "}
                                        {tracking.deliveryLocation?.longitude}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {tracking.deliveryAddress}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h2 className="font-semibold text-gray-900">
                                Live Location
                            </h2>

                            {tracking.liveLocation?.latitude ? (
                                <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        Current delivery boy location
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {tracking.liveLocation.latitude},{" "}
                                        {tracking.liveLocation.longitude}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Updated:{" "}
                                        {tracking.liveLocation.updatedAt
                                            ? new Date(
                                                tracking.liveLocation.updatedAt
                                            ).toLocaleString()
                                            : "N/A"}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-4">
                                    Live location not available yet.
                                </p>
                            )}

                            {tracking.liveLocation?.latitude && (
                                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                                    <iframe
                                    title="Delivery Boy Live Location"
                                    src={`https://maps.google.com/maps?q=${tracking.liveLocation.latitude},${tracking.liveLocation.longitude}&z=15&output=embed`}
                                    className="w-full h-80"
                                    loading="lazy"
                                    ></iframe>
                                    </div>
                                )}
                        </div>
                    </section>

                    <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
                        <h2 className="font-semibold text-gray-900">
                            Delivery Boy
                        </h2>

                        {tracking.deliveryBoy ? (
                            <div className="mt-4 space-y-2 text-sm">
                                <p>
                                    <span className="text-gray-500">Name:</span>{" "}
                                    <span className="font-medium">
                                        {tracking.deliveryBoy.fullName}
                                    </span>
                                </p>

                                <p>
                                    <span className="text-gray-500">Mobile:</span>{" "}
                                    <span className="font-medium">
                                        {tracking.deliveryBoy.mobile}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-4">
                                Delivery boy not assigned yet.
                            </p>
                        )}

                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900">
                                Location History
                            </h3>

                            {history.length === 0 ? (
                                <p className="text-sm text-gray-500 mt-3">
                                    No location history yet.
                                </p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {history.map((location) => (
                                        <div
                                            key={location._id}
                                            className="border-l-2 border-emerald-500 pl-3 text-sm"
                                        >
                                            <p className="font-medium text-gray-900">
                                                {location.place || "Current Location"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(location.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </MainLayout>
    )
}

export default TrackOrder