import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

function SellerDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchDashboard = async () => {
        try {
            const res = await fetch(apiUrl("/seller/dashboard"), {
                method: "GET",
                credentials: "include"
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Failed to fetch dashboard")
                return
            }

            setStats(data)
        } catch (error) {
            setError("Server error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <MainLayout>
                <p className="text-gray-600">Loading seller dashboard...</p>
            </MainLayout>
        )
    }

    if (error) {
        return (
            <MainLayout>
                <p className="text-red-600">{error}</p>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Seller Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage your store, products, orders, and dispatch activity.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <h2 className="text-3xl font-semibold mt-2">
                        {stats?.totalProducts || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <h2 className="text-3xl font-semibold mt-2">
                        {stats?.totalOrders || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <h2 className="text-3xl font-semibold mt-2 text-amber-600">
                        {stats?.pendingOrders || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Delivered Orders</p>
                    <h2 className="text-3xl font-semibold mt-2 text-emerald-600">
                        {stats?.deliveredOrders || 0}
                    </h2>
                </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-500">Total Sales</p>
                <h2 className="text-3xl font-semibold mt-2">
                    ₹{stats?.totalSales || 0}
                </h2>
            </div>
        </MainLayout>
    )
}

export default SellerDashboard