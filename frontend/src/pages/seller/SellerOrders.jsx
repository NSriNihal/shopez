import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-blue-100 text-blue-700",
    assigned: "bg-purple-100 text-purple-700",
    dispatched: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700"
}

function SellerOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [message, setMessage] = useState("")

    const fetchOrders = async ({ isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true)
        }

        try {
            const res = await fetch(apiUrl("/seller/orders"), {
                credentials: "include"
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to fetch orders")
                return
            }

            setOrders(data.orders || [])
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
        fetchOrders()
    }, [])

    const updateOrder = async (orderId, action) => {
        setMessage("")

        try {
            const res = await fetch(
                apiUrl(`/orders/${orderId}/${action}`),
                {
                    method: "PUT",
                    credentials: "include"
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to update order")
                return
            }

            setMessage(data.message || "Order updated")
            fetchOrders()
        } catch (error) {
            setMessage("Server error")
        }
    }

    return (
        <MainLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Orders
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage incoming store orders and delivery status.
                    </p>
                </div>

                <button
                    onClick={() => fetchOrders({ isRefresh: true })}
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
                <p className="text-gray-600">Loading orders...</p>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
                    No orders found.
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

                                        <span
                                            className={`text-xs px-2 py-1 rounded-full capitalize ${
                                                statusStyles[order.status] ||
                                                "bg-gray-100 text-gray-700"
                                            }`}
                                        >
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

                                    {order.deliveryBoy && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Delivery Boy: {order.deliveryBoy.fullName} ·{" "}
                                            {order.deliveryBoy.mobile}
                                        </p>
                                    )}
                                </div>

                                <div className="text-left lg:text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                        ₹{order.totalAmount}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Delivery: ₹{order.deliveryCharge || 0}
                                    </p>
                                </div>
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

                            <div className="mt-4 flex flex-wrap gap-2">
                                {order.status === "pending" && (
                                    <button
                                        onClick={() => updateOrder(order._id, "accept")}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Accept Order
                                    </button>
                                )}

                                {order.status !== "delivered" &&
                                    order.status !== "cancelled" && (
                                        <button
                                            onClick={() => updateOrder(order._id, "cancel")}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    )
}

export default SellerOrders