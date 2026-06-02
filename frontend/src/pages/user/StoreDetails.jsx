import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"
import { resolveCurrentAddress } from "../../utils/location"
import { useAuth } from "../../context/AuthContext"

function StoreDetails() {
    const { storeId } = useParams()
    const navigate = useNavigate()
    const { user, token, refreshUser } = useAuth()

    const [store, setStore] = useState(null)
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState({})
    const [loading, setLoading] = useState(true)
    const [placingOrder, setPlacingOrder] = useState(false)
    const [message, setMessage] = useState("")
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)
    const [locationStatus, setLocationStatus] = useState("")
    const [addressSelected, setAddressSelected] = useState(false)

    const [deliveryData, setDeliveryData] = useState({
        deliveryAddress: "",
        latitude: "",
        longitude: ""
    })
    const [newAddressData, setNewAddressData] = useState({
        label: "",
        address: "",
        latitude: "",
        longitude: ""
    })

    const fetchStoreProducts = async () => {
        try {
            const res = await fetch(
                apiUrl(`/stores/${storeId}/products`),
                {
                    credentials: "include"
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to fetch store")
                return
            }

            setStore(data.store)
            setProducts(data.products || [])
        } catch (error) {
            setMessage("Server error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStoreProducts()
        if (token) {
            refreshUser()
        }
    }, [storeId, token, refreshUser])

    const increaseQty = (product) => {
        setCart({
            ...cart,
            [product._id]: {
                ...product,
                quantity: (cart[product._id]?.quantity || 0) + 1
            }
        })
    }

    const decreaseQty = (productId) => {
        const currentQty = cart[productId]?.quantity || 0

        if (currentQty <= 1) {
            const updatedCart = { ...cart }
            delete updatedCart[productId]
            setCart(updatedCart)
            return
        }

        setCart({
            ...cart,
            [productId]: {
                ...cart[productId],
                quantity: currentQty - 1
            }
        })
    }

    const handleDeliveryChange = (e) => {
        setDeliveryData({
            ...deliveryData,
            [e.target.name]: e.target.value
        })
    }

    const handleNewAddressChange = (e) => {
        setNewAddressData({
            ...newAddressData,
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

                setDeliveryData((current) => ({
                    ...current,
                    deliveryAddress: currentAddress,
                    latitude,
                    longitude
                }))

                setAddressSelected(true)

                setNewAddressData((current) => ({
                    ...current,
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

    const useSavedAddress = (addressId) => {
        const selectedAddress = user?.addresses?.find((item) => item._id === addressId)

        if (!selectedAddress) return

        setDeliveryData({
            deliveryAddress: selectedAddress.address,
            latitude: selectedAddress.latitude,
            longitude: selectedAddress.longitude
        })
        setAddressSelected(true)
        setShowNewAddressForm(false)
    }

    const saveNewAddress = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch(apiUrl("/user/address"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                credentials: "include",
                body: JSON.stringify({
                    ...newAddressData,
                    latitude: Number(newAddressData.latitude),
                    longitude: Number(newAddressData.longitude)
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to add address")
                return
            }

            const savedAddress = data.addresses?.[data.addresses.length - 1]

            if (savedAddress) {
                setDeliveryData({
                    deliveryAddress: savedAddress.address,
                    latitude: savedAddress.latitude,
                    longitude: savedAddress.longitude
                })
                setAddressSelected(true)
            }

            setMessage(data.message || "Address added successfully")
            setNewAddressData({
                label: "",
                address: "",
                latitude: "",
                longitude: ""
            })
            setShowNewAddressForm(false)
            await refreshUser()
        } catch (error) {
            setMessage("Server error")
        }
    }

    const cartItems = Object.values(cart)

    const itemsTotal = cartItems.reduce((total, item) => {
        return total + item.price * item.quantity
    }, 0)

    const deliveryCharge = cartItems.length > 0 ? 40 : 0
    const totalAmount = itemsTotal + deliveryCharge
    const canPlaceOrder = cartItems.length > 0 && addressSelected

    const placeOrder = async (e) => {
        e.preventDefault()
        setMessage("")

        if (cartItems.length === 0) {
            setMessage("Please add at least one product")
            return
        }

        if (!addressSelected) {
            setMessage("Please select an address")
            return
        }

        setPlacingOrder(true)

        const payload = {
            storeId,
            items: cartItems.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            deliveryAddress: deliveryData.deliveryAddress,
            deliveryLocation: {
                latitude: Number(deliveryData.latitude),
                longitude: Number(deliveryData.longitude)
            },
            totalAmount,
            deliveryCharge
        }

        try {
            const res = await fetch(apiUrl("/orders"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to place order")
                return
            }

            setMessage("Order placed successfully")
            setCart({})
            setAddressSelected(false)

            setTimeout(() => {
                navigate("/my-orders")
            }, 700)
        } catch (error) {
            setMessage("Server error")
        } finally {
            setPlacingOrder(false)
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
                    {store?.name}
                </h1>
                <p className="text-gray-500 mt-1">
                    {store?.category} · {store?.address}
                </p>
            </div>

            {message && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Products
                    </h2>

                    {products.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
                            No products available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-40 w-full object-cover bg-gray-100"
                                        />
                                    ) : (
                                        <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900">
                                            {product.name}
                                        </h3>

                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {product.description || "No description"}
                                        </p>

                                        <div className="flex items-center justify-between mt-4">
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ₹{product.price}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Stock: {product.stock}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {cart[product._id] && (
                                                    <>
                                                        <button
                                                            onClick={() => decreaseQty(product._id)}
                                                            className="h-8 w-8 rounded-md bg-gray-100 hover:bg-gray-200"
                                                        >
                                                            -
                                                        </button>

                                                        <span className="w-6 text-center text-sm font-medium">
                                                            {cart[product._id].quantity}
                                                        </span>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => increaseQty(product)}
                                                    disabled={cart[product._id]?.quantity >= product.stock}
                                                    className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-50"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Your Order
                    </h2>

                    {cartItems.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-4">
                            No products added yet.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {cartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex justify-between text-sm border-b border-gray-100 pb-2"
                                >
                                    <span className="text-gray-700">
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-medium">
                                        ₹{item.price * item.quantity}
                                    </span>
                                </div>
                            ))}

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Items Total</span>
                                <span>₹{itemsTotal}</span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Charge</span>
                                <span>₹{deliveryCharge}</span>
                            </div>

                            <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-100 pt-3">
                                <span>Total</span>
                                <span>₹{totalAmount}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={placeOrder} className="mt-5 space-y-3">
                        <div className="space-y-2">
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

                            {!addressSelected && cartItems.length > 0 && (
                                <p className="text-xs font-medium text-amber-600">
                                    Please select an address to place your order.
                                </p>
                            )}

                            {user?.addresses?.length > 0 && (
                                <select
                                    defaultValue=""
                                    onChange={(e) => useSavedAddress(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500 bg-white"
                                >
                                    <option value="" disabled>
                                        Use Saved Address
                                    </option>
                                    {user.addresses.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.label} - {item.address}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowNewAddressForm((current) => !current)}
                                className="w-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-2 rounded-md font-medium"
                            >
                                {showNewAddressForm ? "Hide New Address" : "Add New Address"}
                            </button>
                        </div>

                        {showNewAddressForm && (
                            <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                                <input
                                    name="label"
                                    value={newAddressData.label}
                                    onChange={handleNewAddressChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                    placeholder="Home, Office, Hostel"
                                />

                                <textarea
                                    name="address"
                                    value={newAddressData.address}
                                    onChange={handleNewAddressChange}
                                    required
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                    placeholder="Full delivery address"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        name="latitude"
                                        value={newAddressData.latitude}
                                        onChange={handleNewAddressChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                        placeholder="Latitude"
                                    />

                                    <input
                                        name="longitude"
                                        value={newAddressData.longitude}
                                        onChange={handleNewAddressChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                        placeholder="Longitude"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={detectCurrentLocation}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-md font-medium"
                                >
                                    Detect Current Location
                                </button>

                                <button
                                    type="button"
                                    onClick={saveNewAddress}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium"
                                >
                                    Save & Use Address
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={placingOrder || !canPlaceOrder}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {placingOrder ? "Placing..." : "Place Order"}
                        </button>
                    </form>
                </aside>
            </div>
        </MainLayout>
    )
}

export default StoreDetails