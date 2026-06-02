import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"
import { resolveCurrentAddress } from "../../utils/location"
import { useAuth } from "../../context/AuthContext"

function Profile() {
    const { user, token, refreshUser } = useAuth()
    const [message, setMessage] = useState("")
    const [locationStatus, setLocationStatus] = useState("")
    const [formData, setFormData] = useState({
        label: "",
        address: "",
        latitude: "",
        longitude: ""
    })

    useEffect(() => {
        if (token) {
            refreshUser()
        }
    }, [token, refreshUser])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const detectCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("Geolocation is not supported")
            return
        }

        setLocationStatus("Detecting current location...")

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                const currentAddress = await resolveCurrentAddress({ latitude, longitude })

                setFormData((current) => ({
                    ...current,
                    label: current.label || "Current Location",
                    address: currentAddress,
                    latitude,
                    longitude
                }))

                setLocationStatus(`Current address selected: ${currentAddress}`)
            },
            () => {
                setLocationStatus("Unable to detect location")
            }
        )
    }

    const addAddress = async (e) => {
        e.preventDefault()
        setMessage("")

        const res = await fetch(apiUrl("/user/address"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            credentials: "include",
            body: JSON.stringify({
                ...formData,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            })
        })

        const data = await res.json()

        if (!res.ok) {
            setMessage(data.message || "Failed to add address")
            return
        }

        setMessage(data.message)
        setFormData({
            label: "",
            address: "",
            latitude: "",
            longitude: ""
        })
        await refreshUser()
    }

    const deleteAddress = async (addressId) => {
        const res = await fetch(apiUrl(`/user/address/${addressId}`), {
            method: "DELETE",
            credentials: "include",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        })

        const data = await res.json()
        setMessage(data.message || "Address deleted")
        await refreshUser()
    }

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Profile
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage your saved delivery addresses.
                </p>
            </div>

            {message && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                    onSubmit={addAddress}
                    className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 h-fit"
                >
                    <h2 className="text-lg font-semibold text-gray-900">
                        Add Address
                    </h2>

                    <input
                        name="label"
                        value={formData.label}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Home, Office, Hostel"
                    />

                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Full delivery address"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Latitude"
                        />

                        <input
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Longitude"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={detectCurrentLocation}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-md font-medium"
                    >
                        {locationStatus === "Detecting current location..."
                            ? "Detecting..."
                            : "Detect Current Location"}
                    </button>

                    {locationStatus && (
                        <p className="text-xs text-gray-600">
                            {locationStatus}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium"
                    >
                        Save Address
                    </button>
                </form>

                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Saved Addresses
                    </h2>

                    {!user?.addresses || user.addresses.length === 0 ? (
                        <p className="text-gray-500 mt-4">
                            No saved addresses yet.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {user.addresses.map((item) => (
                                <div
                                    key={item._id}
                                    className="border border-gray-200 rounded-lg p-4 flex justify-between gap-4"
                                >
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {item.label}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.address}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {item.latitude}, {item.longitude}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => deleteAddress(item._id)}
                                        className="text-red-600 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

export default Profile