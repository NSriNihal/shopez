import { useEffect, useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { apiUrl } from "../../api/apiUrl"

const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "general",
    image: "",
    isAvailable: true
}

function Products() {
    const [products, setProducts] = useState([])
    const [formData, setFormData] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [imageError, setImageError] = useState("")
    const [uploadingImage, setUploadingImage] = useState(false)

    const fetchProducts = async () => {
        try {
            const res = await fetch(apiUrl("/seller/products"), {
                credentials: "include"
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to fetch products")
                return
            }

            setProducts(data.products || [])
        } catch (error) {
            setMessage("Server error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        })
    }

    const resetForm = () => {
        setFormData(emptyForm)
        setEditingId(null)
        setMessage("")
        setImageError("")
    }

    // image validation removed — upload-only flow

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        // allow saving even if there's an upload error message; server will validate

        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock)
        }

        try {
            const url = editingId
                ? apiUrl(`/seller/products/${editingId}`)
                : apiUrl("/seller/products")

            const res = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to save product")
                return
            }

            setMessage(data.message || "Product saved successfully")
            resetForm()
            fetchProducts()
        } catch (error) {
            setMessage("Server error")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (product) => {
        setEditingId(product._id)
        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            category: product.category || "general",
            image: product.image || "",
            isAvailable: product.isAvailable
        })
        // keep existing image URL (no validation)
        setMessage("")
    }

    const handleDelete = async (productId) => {
        const confirmDelete = window.confirm("Delete this product?")

        if (!confirmDelete) return

        try {
            const res = await fetch(
                apiUrl(`/seller/products/${productId}`),
                {
                    method: "DELETE",
                    credentials: "include"
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message || "Failed to delete product")
                return
            }

            setMessage(data.message || "Product deleted successfully")
            fetchProducts()
        } catch (error) {
            setMessage("Server error")
        }
    }

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Products
                </h1>
                <p className="text-gray-500 mt-1">
                    Add and manage products available in your store.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-200 rounded-lg p-5 h-fit space-y-4"
                >
                    <h2 className="text-lg font-semibold text-gray-900">
                        {editingId ? "Update Product" : "Add Product"}
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                            placeholder="Rice Bag"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                            placeholder="Short product description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                                placeholder="20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500"
                            placeholder="grocery"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Image
                        </label>
                        <div className="flex gap-2">
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm">
                                {uploadingImage ? "Uploading..." : "Upload"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files && e.target.files[0]
                                        if (!file) return
                                        setUploadingImage(true)
                                        setImageError("")

                                        try {
                                            const fd = new FormData()
                                            fd.append("image", file)

                                            const res = await fetch(
                                                apiUrl("/uploads"),
                                                {
                                                    method: "POST",
                                                    credentials: "include",
                                                    body: fd
                                                }
                                            )

                                            const data = await res.json()

                                            if (!res.ok) {
                                                setImageError(data.message || "Upload failed")
                                            } else {
                                                setFormData({ ...formData, image: data.url })
                                                setImageError("")
                                            }
                                        } catch (err) {
                                            setImageError("Upload error")
                                        } finally {
                                            setUploadingImage(false)
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {imageError && (
                            <p className="text-sm text-red-600 mt-1">{imageError}</p>
                        )}

                        {formData.image && (
                            <div className="mt-2">
                                <img src={formData.image} alt="preview" className="h-32 object-contain border" />
                            </div>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            className="h-4 w-4 accent-emerald-600"
                        />
                        Product is available
                    </label>

                    {message && (
                        <p className="text-sm text-emerald-700">
                            {message}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md font-medium disabled:opacity-60"
                        >
                            {saving ? "Saving..." : editingId ? "Update" : "Add"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-md font-medium"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="lg:col-span-2">
                    {loading ? (
                        <p className="text-gray-600">Loading products...</p>
                    ) : products.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
                            No products added yet.
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
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 capitalize">
                                                    {product.category}
                                                </p>
                                            </div>

                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    product.isAvailable
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {product.isAvailable ? "Available" : "Hidden"}
                                            </span>
                                        </div>

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

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}

export default Products