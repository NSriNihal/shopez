import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"
import { resolveCurrentAddress } from "../../utils/location"
import { useAuth } from "../../context/AuthContext"

function Home() {
    const navigate = useNavigate()
    const { user, token, refreshUser } = useAuth()
    const [stores, setStores] = useState([])
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState({})
    const [cartOpen, setCartOpen] = useState(false)
    const [placingOrder, setPlacingOrder] = useState(false)
    const [deliveryData, setDeliveryData] = useState({
        deliveryAddress: "",
        latitude: "",
        longitude: ""
    })
    const [addressSelected, setAddressSelected] = useState(false)
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)
    const [newAddressData, setNewAddressData] = useState({
        label: "",
        address: "",
        latitude: "",
        longitude: ""
    })
    const [locationStatus, setLocationStatus] = useState("")
    const [keyword, setKeyword] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const fetchStores = async () => {
        setLoading(true)
        setMessage("")

        try {
            const res = await fetch(apiUrl("/stores"), {
                credentials: "include"
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to fetch stores")
                return
            }

            const storeList = data.stores || []
            setStores(storeList)

            await fetchAllProducts(storeList)
        } catch (error) {
            setMessage("Server error")
        } finally {
            setLoading(false)
        }
    }

    const fetchAllProducts = async (storeList) => {
        try {
            const productRequests = storeList.map((store) =>
                fetch(apiUrl(`/stores/${store._id}/products`), {
                    credentials: "include"
                }).then((res) => res.json())
            )

            const results = await Promise.all(productRequests)

            const allProducts = results.flatMap((result) => {
                return (result.products || []).map((product) => ({
                    ...product,
                    store: result.store
                }))
            })

            setProducts(allProducts)
        } catch (error) {
            setProducts([])
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
    }

    const addToCart = (product) => {
        setCart((currentCart) => ({
            ...currentCart,
            [product._id]: {
                ...product,
                quantity: (currentCart[product._id]?.quantity || 0) + 1
            }
        }))
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

    const handlePlaceOrder = async (e) => {
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

        const storeIds = [...new Set(cartItems.map((item) => item.store?._id).filter(Boolean))]

        if (storeIds.length !== 1) {
            setMessage("Please place orders from one store at a time")
            return
        }

        setPlacingOrder(true)

        const storeId = storeIds[0]
        const deliveryCharge = cartItems.length > 0 ? 40 : 0
        const totalAmount = itemsTotal + deliveryCharge

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
            setDeliveryData({
                deliveryAddress: "",
                latitude: "",
                longitude: ""
            })
            setCartOpen(false)

            setTimeout(() => {
                navigate("/my-orders")
            }, 700)
        } catch (error) {
            setMessage("Server error")
        } finally {
            setPlacingOrder(false)
        }
    }

    const increaseQty = (product) => {
        setCart((currentCart) => ({
            ...currentCart,
            [product._id]: {
                ...currentCart[product._id],
                quantity: (currentCart[product._id]?.quantity || 0) + 1
            }
        }))
    }

    const decreaseQty = (productId) => {
        setCart((currentCart) => {
            const currentQty = currentCart[productId]?.quantity || 0

            if (currentQty <= 1) {
                const updatedCart = { ...currentCart }
                delete updatedCart[productId]
                return updatedCart
            }

            return {
                ...currentCart,
                [productId]: {
                    ...currentCart[productId],
                    quantity: currentQty - 1
                }
            }
        })
    }

    const removeItem = (productId) => {
        setCart((currentCart) => {
            const updatedCart = { ...currentCart }
            delete updatedCart[productId]
            return updatedCart
        })
    }

    const cartItems = useMemo(() => Object.values(cart), [cart])

    const itemsTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    }, [cartItems])

    const cartCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0)
    }, [cartItems])

    const deliveryCharge = cartItems.length > 0 ? 25 : 0
    const handlingCharge = cartItems.length > 0 ? 2 : 0
    const grandTotal = itemsTotal + deliveryCharge + handlingCharge
    const canPlaceOrder = cartItems.length > 0 && addressSelected

    const normalizedKeyword = keyword.trim().toLowerCase()

    const filteredStores = useMemo(() => {
        if (!normalizedKeyword) return stores

        return stores.filter((store) => {
            const name = (store.name || "").toLowerCase()
            const category = (store.category || "").toLowerCase()
            const address = (store.address || "").toLowerCase()

            return (
                name.includes(normalizedKeyword) ||
                category.includes(normalizedKeyword) ||
                address.includes(normalizedKeyword)
            )
        })
    }, [stores, normalizedKeyword])

    const filteredProducts = useMemo(() => {
        if (!normalizedKeyword) return products

        return products.filter((product) => {
            const productName = (product.name || "").toLowerCase()
            const description = (product.description || "").toLowerCase()
            const storeName = (product.store?.name || "").toLowerCase()
            const category = (product.category || "").toLowerCase()

            return (
                productName.includes(normalizedKeyword) ||
                description.includes(normalizedKeyword) ||
                storeName.includes(normalizedKeyword) ||
                category.includes(normalizedKeyword)
            )
        })
    }, [products, normalizedKeyword])

    return (
        <MainLayout>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Nearby Stores
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Browse local groceries, pharmacies, and restaurants.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-64 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="Search stores"
                    />

                    <button
                        type="submit"
                        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Search
                    </button>
                </form>
            </div>

            {message && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                    {message}
                </div>
            )}

            {loading ? (
                <p className="text-gray-600">Loading stores...</p>
            ) : (
                <>
                    <section>
                        {filteredStores.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
                                No stores found.
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {filteredStores.map((store) => (
                                    <Link
                                        key={store._id}
                                        to={`/stores/${store._id}`}
                                        className="min-w-[280px] max-w-[280px] bg-white border border-gray-200 rounded-lg p-5 hover:border-emerald-500 transition"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="font-semibold text-gray-900">
                                                    {store.name}
                                                </h2>
                                                <p className="text-sm text-gray-500 capitalize mt-1">
                                                    {store.category}
                                                </p>
                                            </div>

                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    store.isOpen
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {store.isOpen ? "Open" : "Closed"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                                            {store.address}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-4">
                                            Seller: {store.seller?.fullName || "N/A"}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="mt-8">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Available Products
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Products from nearby open stores.
                            </p>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
                                No products available.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="bg-white border border-gray-200 rounded-lg overflow-hidden transition"
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

                                            <p className="text-sm text-gray-500 mt-1">
                                                {product.store?.name}
                                            </p>

                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {product.description || "No description"}
                                            </p>

                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ₹{product.price}
                                                </p>

                                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                    Stock {product.stock}
                                                </span>
                                            </div>

                                            {cart[product._id] ? (
                                                <div className="mt-4 flex items-center justify-between rounded-md border border-emerald-600 bg-emerald-600 text-white overflow-hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => decreaseQty(product._id)}
                                                        className="flex-1 py-2 text-lg font-semibold hover:bg-emerald-700"
                                                    >
                                                        -
                                                    </button>

                                                    <span className="min-w-12 text-center text-sm font-semibold px-3">
                                                        {cart[product._id].quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => increaseQty(product)}
                                                        disabled={cart[product._id].quantity >= product.stock}
                                                        className="flex-1 py-2 text-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(product)}
                                                    className="mt-4 w-full rounded-md border border-emerald-600 bg-white text-emerald-600 text-base font-semibold py-2.5 hover:bg-emerald-50"
                                                >
                                                    ADD
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {cartOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close cart"
                        onClick={() => setCartOpen(false)}
                        className="fixed inset-0 bg-black/30 z-40"
                    />

                    <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Cart</h2>
                                <p className="text-sm text-gray-500">{cartCount} item{cartCount === 1 ? "" : "s"}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCartOpen(false)}
                                className="text-gray-500 hover:text-gray-900 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cartItems.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                    Your cart is empty.
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="border border-gray-200 rounded-lg p-3 flex gap-3"
                                    >
                                        <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 line-clamp-1">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 line-clamp-1">
                                                        {item.store?.name}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item._id)}
                                                    className="text-xs text-red-600 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <p className="font-semibold text-gray-900">₹{item.price}</p>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => decreaseQty(item._id)}
                                                        className="h-8 w-8 rounded-md bg-gray-100 hover:bg-gray-200"
                                                    >
                                                        -
                                                    </button>

                                                    <span className="w-6 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => increaseQty(item)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="h-8 w-8 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Items total</span>
                                <span>₹{itemsTotal}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Delivery charge</span>
                                <span>₹{deliveryCharge}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Handling charge</span>
                                <span>₹{handlingCharge}</span>
                            </div>

                            <div className="flex items-center justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{grandTotal}</span>
                            </div>

                            <form onSubmit={handlePlaceOrder} className="space-y-3 pt-2">
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
                                    className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {placingOrder ? "Placing..." : "Place Order"}
                                </button>
                            </form>
                        </div>
                    </aside>
                </>
            )}

            <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="fixed bottom-5 right-5 z-30 rounded-2xl bg-emerald-600 text-white px-5 py-4 shadow-xl hover:bg-emerald-700 flex items-center gap-3"
            >
                <span className="text-xl">🛒</span>
                <span className="font-semibold text-sm leading-tight text-left">
                    {cartCount > 0 ? `${cartCount} item` : "Cart"}
                    <span className="block text-xs font-medium opacity-90">
                        ₹{grandTotal}
                    </span>
                </span>
            </button>
        </MainLayout>
    )
}

export default Home