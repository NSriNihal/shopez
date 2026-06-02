import Store from "../models/storeModel.js"
import Product from "../models/productModel.js"
import { normalizeAssetUrl } from "../utils/publicUrl.js"

// Get all open stores
export const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({ isOpen: true })
            .populate("seller", "fullName mobile email")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: stores.length,
            stores
        })
    } catch (error) {
        return res.status(500).json({ message: "getAllStores error", error })
    }
}

// Get all stores for admin
export const getAllStoresAdmin = async (req, res) => {
    try {
        const stores = await Store.find()
            .populate("seller", "fullName mobile email")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: stores.length,
            stores
        })
    } catch (error) {
        return res.status(500).json({ message: "getAllStoresAdmin error", error })
    }
}

// Get store by id
export const getStoreById = async (req, res) => {
    try {
        const { storeId } = req.params

        const store = await Store.findById(storeId)
            .populate("seller", "fullName mobile email")

        if (!store) {
            return res.status(404).json({ message: "Store not found" })
        }

        return res.status(200).json(store)
    } catch (error) {
        return res.status(500).json({ message: "getStoreById error", error })
    }
}

// Get products of a store
export const getStoreProducts = async (req, res) => {
    try {
        const { storeId } = req.params

        const store = await Store.findById(storeId)

        if (!store) {
            return res.status(404).json({ message: "Store not found" })
        }

        const products = await Product.find({
            store: storeId,
            isAvailable: true
        }).sort({ createdAt: -1 })

        const normalizedProducts = products.map((product) => {
            const productData = product.toObject()
            productData.image = normalizeAssetUrl(productData.image, req)
            return productData
        })

        return res.status(200).json({
            store,
            count: normalizedProducts.length,
            products: normalizedProducts
        })
    } catch (error) {
        return res.status(500).json({ message: "getStoreProducts error", error })
    }
}

// Get stores by category
export const getStoresByCategory = async (req, res) => {
    try {
        const { category } = req.params

        const stores = await Store.find({
            category,
            isOpen: true
        })
            .populate("seller", "fullName mobile email")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: stores.length,
            stores
        })
    } catch (error) {
        return res.status(500).json({ message: "getStoresByCategory error", error })
    }
}

// Search stores by name or address
export const searchStores = async (req, res) => {
    try {
        const { keyword } = req.query

        if (!keyword) {
            return res.status(400).json({ message: "Search keyword is required" })
        }

        const stores = await Store.find({
            isOpen: true,
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { address: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } }
            ]
        }).populate("seller", "fullName mobile email")

        return res.status(200).json({
            count: stores.length,
            stores
        })
    } catch (error) {
        return res.status(500).json({ message: "searchStores error", error })
    }
}

// Admin delete store
export const deleteStore = async (req, res) => {
    try {
        const { storeId } = req.params

        const store = await Store.findById(storeId)

        if (!store) {
            return res.status(404).json({ message: "Store not found" })
        }

        await Product.deleteMany({ store: storeId })
        await store.deleteOne()

        return res.status(200).json({ message: "Store deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "deleteStore error", error })
    }
}