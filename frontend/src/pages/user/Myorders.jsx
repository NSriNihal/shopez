import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
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

function MyOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [message, setMessage] = useState("")
    
    // Rating modal state
    const [ratingModal, setRatingModal] = useState({
        isOpen: false,
        orderId: null,
        productId: null,
        productName: "",
        rating: 5,
        comment: ""
    })
    const [submittingRating, setSubmittingRating] = useState(false)
    const [ratingError, setRatingError] = useState("")
    const [ratingSuccess, setRatingSuccess] = useState("")

    const fetchOrders = async ({ isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true)
        }

        try {
            const res = await fetch(apiUrl("/orders/my"), {
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

    const cancelOrder = async (orderId) => {
        const confirmCancel = window.confirm("Cancel this order?")

        if (!confirmCancel) return

        try {
            const res = await fetch(
                apiUrl(`/orders/${orderId}/cancel`),
                {
                    method: "PUT",
                    credentials: "include"
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to cancel order")
                return
            }

            setMessage(data.message || "Order cancelled")
            fetchOrders()
        } catch (error) {
            setMessage("Server error")
        }
    }

    const openRatingModal = (orderId, product) => {
        setRatingModal({
            isOpen: true,
            orderId,
            productId: product.product,
            productName: product.name,
            rating: 5,
            comment: ""
        })
        setRatingError("")
        setRatingSuccess("")
    }

    const closeRatingModal = () => {
        setRatingModal((prev) => ({ ...prev, isOpen: false }))
    }

    const submitReview = async (e) => {
        e.preventDefault()
        setSubmittingRating(true)
        setRatingError("")
        setRatingSuccess("")

        try {
            const res = await fetch(apiUrl("/reviews"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    productId: ratingModal.productId,
                    orderId: ratingModal.orderId,
                    rating: ratingModal.rating,
                    comment: ratingModal.comment
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setRatingError(data.message || "Failed to submit review")
                setSubmittingRating(false)
                return
            }

            setRatingSuccess("Review submitted successfully!")
            setTimeout(() => {
                closeRatingModal()
                // Could refresh orders or mark locally as reviewed
            }, 1500)
        } catch (error) {
            setRatingError("Server error")
        } finally {
            setSubmittingRating(false)
        }
    }

    return (
        <MainLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        My Orders
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Track and manage your recent orders.
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
                                        Store: {order.store?.name || "N/A"}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Address: {order.deliveryAddress}
                                    </p>

                                    {order.deliveryBoy && (
                                            <p className="text-sm text-emerald-600 mt-1">
                                                Delivery Partner: {order.deliveryBoy.fullName} ·{" "}
                                                {order.deliveryBoy.mobile}
                                            </p>
                                    )}
                                </div>

                                <div className="text-left lg:text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                        ₹{order.totalAmount}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Shipping: ₹{order.deliveryCharge || 0}
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
                                            <span className="text-gray-700 flex items-center gap-2">
                                                {item.name} × {item.quantity}
                                                {order.status === "delivered" && item.product && (
                                                    <button
                                                        onClick={() => openRatingModal(order._id, item)}
                                                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                                    >
                                                        Rate
                                                    </button>
                                                )}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                ₹{item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {["pending", "accepted"].includes(order.status) && (
                                    <button
                                        onClick={() => cancelOrder(order._id)}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Cancel Order
                                    </button>
                                )}

                                {["assigned", "dispatched"].includes(order.status) && (
                                    <Link
                                        to={`/track/${order._id}`}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Track Order
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {ratingModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Rate Product</h2>
                        <p className="text-sm text-gray-500 mb-4">You are rating: {ratingModal.productName}</p>

                        <form onSubmit={submitReview}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                                            className={`text-2xl ${ratingModal.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                                <textarea
                                    value={ratingModal.comment}
                                    onChange={(e) => setRatingModal({ ...ratingModal, comment: e.target.value })}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                    placeholder="Write your review here..."
                                ></textarea>
                            </div>

                            {ratingError && <p className="text-sm text-red-600 mb-3">{ratingError}</p>}
                            {ratingSuccess && <p className="text-sm text-emerald-600 mb-3">{ratingSuccess}</p>}

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={closeRatingModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingRating || ratingSuccess}
                                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {submittingRating ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}

export default MyOrders