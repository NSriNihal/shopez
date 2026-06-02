import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/common/Navbar"
import Logo from "../../components/common/Logo"
import { apiUrl } from "../../api/apiUrl"
import { useAuth } from "../../context/AuthContext"

const API_URL = apiUrl("/auth")

function Login() {
    const navigate = useNavigate()
    const { login, user, loading: authLoading } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        mobile: "",
        role: "user"
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    useEffect(() => {
        if (authLoading || !user) {
            return
        }

        if (user.role === "seller") {
            navigate("/seller/dashboard", { replace: true })
            return
        }

        if (user.role === "deliveryBoy") {
            navigate("/delivery-boy/dashboard", { replace: true })
            return
        }

        if (user.role === "admin") {
            navigate("/admin/dashboard", { replace: true })
            return
        }

        navigate("/", { replace: true })
    }, [authLoading, navigate, user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const endpoint = isSignUp ? `${API_URL}/signup` : `${API_URL}/signin`

            const body = isSignUp
                ? formData
                : { email: formData.email, password: formData.password }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Something went wrong")
                return
            }

            login(data.user, data.token)

            setMessage(data.message || "Success")

            if (data.user.role === "seller") navigate("/seller/dashboard", { replace: true })
            else if (data.user.role === "deliveryBoy") navigate("/delivery-boy/dashboard", { replace: true })
            else if (data.user.role === "admin") navigate("/admin/dashboard", { replace: true })
            else navigate("/", { replace: true })
        } catch (error) {
            setMessage("Server error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="hidden lg:flex flex-col justify-center items-start bg-emerald-600 rounded-lg p-8 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                                <Logo size={12} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Shopez</h2>
                                <p className="text-sm opacity-90">E-commerce Application</p>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{isSignUp ? "Create your account" : "Welcome back"}</h3>
                        <p className="text-sm opacity-90">Manage products, stores, and orders from one e-commerce workspace.</p>
                    </div>

                    <div className="w-full bg-white border border-gray-200 rounded-lg p-8 shadow">
                        <div className="mb-6 text-center">
                            <div className="mx-auto">
                                <Logo />
                            </div>
                            <h1 className="text-2xl font-semibold mt-3 text-gray-900">{isSignUp ? "Create account" : "Welcome back"}</h1>
                            <p className="text-sm text-gray-500 mt-1">E-commerce Application</p>
                        </div>

                        <div className="grid grid-cols-2 bg-zinc-100 rounded-md p-1 mb-6">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(false)}
                                className={`py-2 rounded-md text-sm font-medium ${!isSignUp ? "bg-white text-zinc-900" : "text-gray-500"}`}>
                                Sign In
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSignUp(true)}
                                className={`py-2 rounded-md text-sm font-medium ${isSignUp ? "bg-white text-zinc-900" : "text-gray-500"}`}>
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignUp && (
                                <div>
                                    <label className="block text-sm mb-1 text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm mb-1 text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                                    placeholder="Enter email"
                                />
                            </div>

                            {isSignUp && (
                                <div>
                                    <label className="block text-sm mb-1 text-gray-700">Mobile</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm mb-1 text-gray-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                                    placeholder="Enter password"
                                />
                            </div>

                            {isSignUp && (
                                <div>
                                    <label className="block text-sm mb-2 text-gray-700">Select Role</label>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: "User", value: "user" },
                                            { label: "Seller", value: "seller" },
                                            { label: "Delivery", value: "deliveryBoy" }
                                        ].map((role) => (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: role.value })}
                                                className={`py-2 rounded-md border text-sm ${formData.role === role.value ? "bg-emerald-500 border-emerald-500 text-white font-semibold" : "bg-white border-gray-200 text-gray-700"}`}>
                                                {role.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {message && <p className="text-sm text-amber-500">{message}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-md disabled:opacity-60"
                            >
                                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login
