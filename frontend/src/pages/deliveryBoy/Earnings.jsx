import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

function Earnings() {
    const [earningsData, setEarningsData] = useState(null)
    const [todayData, setTodayData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [message, setMessage] = useState("")

    const fetchEarnings = async ({ isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true)
        }

        try {
            const [earningsRes, todayRes] = await Promise.all([
                fetch(apiUrl("/earnings/my"), {
                    credentials: "include"
                }),
                fetch(apiUrl("/earnings/today"), {
                    credentials: "include"
                })
            ])

            const earningsJson = await earningsRes.json()
            const todayJson = await todayRes.json()

            if (!earningsRes.ok) {
                setMessage(earningsJson.message || "Failed to fetch earnings")
                return
            }

            setEarningsData(earningsJson)

            if (todayRes.ok) {
                setTodayData(todayJson)
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
        fetchEarnings()
    }, [])

    if (loading) {
        return (
            <MainLayout>
                <p className="text-gray-600">Loading earnings...</p>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Earnings
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Track your delivery income and payout status.
                    </p>
                </div>

                <button
                    onClick={() => fetchEarnings({ isRefresh: true })}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <h2 className="text-2xl font-semibold mt-2">
                        ₹{earningsData?.totalEarnings || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Today</p>
                    <h2 className="text-2xl font-semibold mt-2">
                        ₹{todayData?.todayEarnings || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Paid</p>
                    <h2 className="text-2xl font-semibold mt-2 text-emerald-600">
                        ₹{earningsData?.paidEarnings || 0}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-500">Pending</p>
                    <h2 className="text-2xl font-semibold mt-2 text-amber-600">
                        ₹{earningsData?.pendingEarnings || 0}
                    </h2>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Earning History
                    </h2>
                </div>

                {!earningsData?.earnings || earningsData.earnings.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No earnings yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-5 py-3 font-medium">
                                        Order
                                    </th>
                                    <th className="text-left px-5 py-3 font-medium">
                                        Amount
                                    </th>
                                    <th className="text-left px-5 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="text-left px-5 py-3 font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {earningsData.earnings.map((earning) => (
                                    <tr key={earning._id}>
                                        <td className="px-5 py-3 text-gray-900">
                                            #{earning.order?._id?.slice(-6).toUpperCase() || "N/A"}
                                        </td>

                                        <td className="px-5 py-3 font-semibold text-gray-900">
                                            ₹{earning.amount}
                                        </td>

                                        <td className="px-5 py-3">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full capitalize ${
                                                    earning.status === "paid"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-amber-100 text-amber-700"
                                                }`}
                                            >
                                                {earning.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-3 text-gray-500">
                                            {new Date(earning.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}

export default Earnings