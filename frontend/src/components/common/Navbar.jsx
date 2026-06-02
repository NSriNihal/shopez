import { Link, useNavigate } from "react-router-dom"
import Logo from "./Logo"
import { useAuth } from "../../context/AuthContext"

function Navbar() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    const getDashboardLink = () => {
        if (!user) return "/login"

        if (user.role === "seller") return "/seller/dashboard"
        if (user.role === "deliveryBoy") return "/delivery-boy/dashboard"
        if (user.role === "admin") return "/admin/dashboard"

        return "/"
    }

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to={getDashboardLink()} className="flex items-center gap-2">
                        <Logo />
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Shopez
                            </h1>
                            <p className="text-xs text-gray-500">
                                E-commerce Application
                            </p>
                        </div>
                    </Link>

                {user && (
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
                        {user.role === "user" && (
                             <>
                             <Link to="/" className="hover:text-emerald-600">
                             Stores
                             </Link>
                             <Link to="/my-orders" className="hover:text-emerald-600">
                             My Orders
                             </Link>
                             <Link to="/profile" className="hover:text-emerald-600">
                              Profile
                            </Link>
                            </>
                        )}
                        {user.role === "seller" && (
                            <>
                                <Link to="/seller/dashboard" className="hover:text-emerald-600">
                                    Dashboard
                                </Link>
                                <Link to="/seller/store" className="hover:text-emerald-600">
                                    Store
                                </Link>
                                <Link to="/seller/products" className="hover:text-emerald-600">
                                    Products
                                </Link>
                                <Link to="/seller/orders" className="hover:text-emerald-600">
                                    Orders
                                </Link>
                                 <Link to="/seller/dispatch" className="hover:text-emerald-600">
                                    Dispatch
                                 </Link>
                            </>
                        )}

                        {user.role === "deliveryBoy" && (
                            <>
                                <Link to="/delivery-boy/dashboard" className="hover:text-emerald-600">
                                    Dashboard
                                </Link>
                                <Link to="/delivery-boy/orders" className="hover:text-emerald-600">
                                    Assigned Orders
                                </Link>
                                <Link to="/delivery-boy/earnings" className="hover:text-emerald-600">
                                    Earnings
                                </Link>
                            </>
                        )}

                        {user.role === "admin" && (
                            <>
                                <Link to="/admin/dashboard" className="hover:text-emerald-600">
                                    Dashboard
                                </Link>
                                <Link to="/admin/users" className="hover:text-emerald-600">
                                    Users
                                </Link>
                                <Link to="/admin/orders" className="hover:text-emerald-600">
                                    Orders
                                </Link>
                                <Link to="/admin/stores" className="hover:text-emerald-600">
                                    Stores
                                </Link>
                            </>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.fullName}
                                </p>
                                <p className="text-xs capitalize text-gray-500">
                                    {user.role}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                            >
                                Logout
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </nav>
    )
}

export default Navbar