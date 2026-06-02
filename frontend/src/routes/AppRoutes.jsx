import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Login from "../pages/auth/login.jsx"
import Home from "../pages/user/Home.jsx"
import SellerDashboard from "../pages/seller/SellerDashboard.jsx"
import MyStore from "../pages/seller/Mystore.jsx"
import Products from "../pages/seller/products.jsx"
import SellerOrders from "../pages/seller/SellerOrders.jsx"
import DispatchOrders from "../pages/seller/DispatchOrders.jsx"
import StoreDetails from "../pages/user/StoreDetails.jsx"
import MyOrders from "../pages/user/Myorders.jsx"
import TrackOrder from "../pages/user/TrackOrder.jsx"
import Profile from "../pages/user/Profile.jsx"
import DeliveryDashboard from "../pages/deliveryBoy/DeliveryDashboard.jsx"
import AssignedOrders from "../pages/deliveryBoy/AssingnedOrders.jsx"
import Earnings from "../pages/deliveryBoy/Earnings.jsx"

function RootRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return null
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Home />
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<RootRoute />} />

            <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/store" element={<MyStore />} />
            <Route path="/seller/products" element={<Products />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/dispatch" element={<DispatchOrders />} />
            <Route path="/stores/:storeId" element={<StoreDetails />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/track/:orderId" element={<TrackOrder />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/delivery-boy" element={<Navigate to="/delivery-boy/dashboard" replace />} />
            <Route path="/delivery-boy/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery-boy/orders" element={<AssignedOrders />} />
            <Route path="/delivery-boy/earnings" element={<Earnings />} />
        </Routes>
    )
}

export default AppRoutes