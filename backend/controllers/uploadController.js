import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import { getRequestBaseUrl } from "../utils/publicUrl.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"))
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext
    cb(null, name)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"), false)
  }
}

export const uploadSingle = multer({ storage, fileFilter }).single("image")

export const uploadHandler = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" })
  }

  const baseUrl = getRequestBaseUrl(req)
  const url = `${baseUrl}/uploads/${req.file.filename}`

  return res.status(200).json({ url })
}

export default {
  uploadSingle,
  uploadHandler
}
