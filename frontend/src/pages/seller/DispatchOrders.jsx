import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

const calculateDistanceInKm = (start, end) => {
    const toRadians = (value) => (value * Math.PI) / 180

    const startLat = Number(start?.latitude)
    const startLon = Number(start?.longitude)
    const endLat = Number(end?.latitude)
    const endLon = Number(end?.longitude)

    if (
        Number.isNaN(startLat) ||
        Number.isNaN(startLon) ||
        Number.isNaN(endLat) ||
        Number.isNaN(endLon)
    ) {
        return 0
    }

    const earthRadiusKm = 6371
    const deltaLat = toRadians(endLat - startLat)
    const deltaLon = toRadians(endLon - startLon)
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(toRadians(startLat)) *
            Math.cos(toRadians(endLat)) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

    return Number((2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2))
}

const formatDistance = (distanceInKm) => {
    if (!Number.isFinite(distanceInKm)) {
        return "N/A"
    }

    if (distanceInKm < 1) {
        return `${Math.round(distanceInKm * 1000)} m`
    }

    return `${distanceInKm} km`
}

function DispatchOrders() {
    const [orders, setOrders] = useState([])
    const [deliveryBoys, setDeliveryBoys] = useState([])
    const [selectedBoys, setSelectedBoys] = useState({})
    const [assigningOrderId, setAssigningOrderId] = useState("")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [message, setMessage] = useState("")

    const fetchData = async ({ isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true)
        }

        try {
            const [ordersRes, boysRes] = await Promise.all([
                fetch(apiUrl("/seller/orders"), {
                    credentials: "include"
                }),
                fetch(apiUrl("/dispatch/available-delivery-boys"), {
                    credentials: "include"
                })
            ])

            const ordersData = await ordersRes.json()
            const boysData = await boysRes.json()

            if (ordersRes.ok) {
                const dispatchOrders = (ordersData.orders || []).filter((order) => {
                    return order.status === "accepted" || order.status === "assigned"
                })

                const ordersWithDistance = dispatchOrders.map((order) => ({
                    ...order,
                    calculatedDistanceInKm: calculateDistanceInKm(
                        order.store?.location,
                        order.deliveryLocation
                    )
                }))

                setOrders(ordersWithDistance)
            } else {
                setMessage(ordersData.message || "Failed to fetch orders")
            }

            if (boysRes.ok) {
                setDeliveryBoys(boysData.deliveryBoys || [])
            } else {
                setMessage(boysData.message || "Failed to fetch delivery boys")
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
        fetchData()
    }, [])

    const handleAssign = async (orderId) => {
        const deliveryBoyId = selectedBoys[orderId]

        if (!deliveryBoyId) {
            setMessage("Please select a delivery boy")
            return
        }

        try {
            setAssigningOrderId(orderId)
            setMessage("")
            const res = await fetch(
                apiUrl(`/dispatch/assign/${orderId}`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        deliveryBoyId
                    })
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to assign delivery boy")
                return
            }

            setMessage(data.message || "Delivery boy assigned successfully")
            fetchData()
        } catch (error) {
            setMessage("Server error")
        } finally {
            setAssigningOrderId("")
        }
    }
    return (
        <MainLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Dispatch Orders
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Assign available delivery boys to accepted orders.
                    </p>
                </div>

                <button
                    onClick={() => fetchData({ isRefresh: true })}
                    disabled={refreshing}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {message && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                    {message}
                </div>
            )}

            {loading ? (
                <p className="text-gray-600">Loading dispatch orders...</p>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
                    No accepted orders ready for dispatch.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white border border-gray-200 rounded-lg p-5"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold text-gray-900">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </h2>

                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                                            {order.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Customer: {order.user?.fullName || "N/A"} ·{" "}
                                        {order.user?.mobile || "No mobile"}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Address: {order.deliveryAddress}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Total: ₹{order.totalAmount} · Delivery: ₹
                                        {order.deliveryCharge || 0}
                                    </p>

                                    {order.deliveryBoy && (
                                        <p className="text-sm text-emerald-600 mt-2">
                                            Assigned to {order.deliveryBoy.fullName}
                                        </p>
                                    )}
                                </div>

                                {order.status === "accepted" && (
                                    <div className="w-full lg:w-80 space-y-3">
                                        <select
                                            value={selectedBoys[order._id] || ""}
                                            onChange={(e) =>
                                                setSelectedBoys({
                                                    ...selectedBoys,
                                                    [order._id]: e.target.value
                                                })
                                            }
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                        >
                                            <option value="">Select delivery boy</option>
                                            {deliveryBoys.map((boy) => (
                                                <option key={boy._id} value={boy._id}>
                                                    {boy.fullName} - {boy.mobile}
                                                </option>
                                            ))}
                                        </select>

                                        {deliveryBoys.length === 0 && (
                                            <p className="text-xs text-amber-600">
                                                No available delivery boys right now.
                                            </p>
                                        )}

                                        {selectedBoys[order._id] === "" && (
                                            <p className="text-xs text-gray-500">
                                                Select a delivery boy to enable assignment.
                                            </p>
                                        )}

                                        <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                            Auto distance: {formatDistance(order.calculatedDistanceInKm)}
                                        </div>

                                        <button
                                            onClick={() => handleAssign(order._id)}
                                            disabled={!selectedBoys[order._id] || deliveryBoys.length === 0 || assigningOrderId === order._id}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {assigningOrderId === order._id ? "Assigning..." : "Assign Delivery Boy"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                    Items
                                </h3>

                                <div className="space-y-2">
                                    {order.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-2"
                                        >
                                            <span className="text-gray-700">
                                                {item.name} × {item.quantity}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                ₹{item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    )
}

export default DispatchOrders