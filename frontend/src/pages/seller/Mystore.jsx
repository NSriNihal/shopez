import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

function MyStore() {
    const [store, setStore] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        category: "grocery",
        address: "",
        latitude: "",
        longitude: "",
        isOpen: true
    })

    const fetchStore = async () => {
        try {
            const res = await fetch(apiUrl("/seller/store"), {
                credentials: "include"
            })

            const data = await res.json()

            if (res.ok) {
                setStore(data)
                setFormData({
                    name: data.name || "",
                    category: data.category || "grocery",
                    address: data.address || "",
                    latitude: data.location?.latitude || "",
                    longitude: data.location?.longitude || "",
                    isOpen: data.isOpen
                })
            }
        } catch (error) {
            setMessage("Server error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStore()
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        const payload = {
            name: formData.name,
            category: formData.category,
            address: formData.address,
            location: {
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            },
            isOpen: formData.isOpen
        }

        try {
            const res = await fetch(apiUrl("/seller/store"), {
                method: store ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to save store")
                return
            }

            setStore(data.store)
            setMessage(data.message || "Store saved successfully")
        } catch (error) {
            setMessage("Server error")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <p className="text-gray-600">Loading store...</p>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    My Store
                </h1>
                <p className="text-gray-500 mt-1">
                    Create and manage your local store details.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Store Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                            placeholder="Fresh Mart"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                        >
                            <option value="grocery">Grocery</option>
                            <option value="pharmacy">Pharmacy</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                            placeholder="Enter full store address"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                placeholder="12.9716"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                placeholder="77.5946"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="isOpen"
                            checked={formData.isOpen}
                            onChange={handleChange}
                            className="h-4 w-4 accent-emerald-600"
                        />
                        Store is open
                    </label>

                    {message && (
                        <p className="text-sm text-emerald-700">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md font-medium disabled:opacity-60"
                    >
                        {saving ? "Saving..." : store ? "Update Store" : "Create Store"}
                    </button>
                </form>

                <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Store Preview
                    </h2>

                    {store ? (
                        <div className="mt-4 space-y-3 text-sm">
                            <p>
                                <span className="text-gray-500">Name:</span>{" "}
                                <span className="font-medium">{store.name}</span>
                            </p>

                            <p>
                                <span className="text-gray-500">Category:</span>{" "}
                                <span className="font-medium capitalize">{store.category}</span>
                            </p>

                            <p>
                                <span className="text-gray-500">Address:</span>{" "}
                                <span className="font-medium">{store.address}</span>
                            </p>

                            <p>
                                <span className="text-gray-500">Status:</span>{" "}
                                <span
                                    className={`font-medium ${
                                        store.isOpen ? "text-emerald-600" : "text-red-600"
                                    }`}
                                >
                                    {store.isOpen ? "Open" : "Closed"}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">Location:</span>{" "}
                                <span className="font-medium">
                                    {store.location?.latitude}, {store.location?.longitude}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-4 text-sm">
                            No store created yet.
                        </p>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

export default MyStore