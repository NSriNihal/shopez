import express from "express"
import { uploadSingle, uploadHandler } from "../controllers/uploadController.js"

const router = express.Router()

// Public upload endpoint (no auth) to avoid blocking uploads from unauthenticated clients.
// Multer errors are handled and returned as JSON.
router.post("/", (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message })
    try {
      uploadHandler(req, res)
    } catch (e) {
      return res.status(500).json({ message: "Upload handler error" })
    }
  })
})

export default router
