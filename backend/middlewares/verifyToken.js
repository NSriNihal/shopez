import jwt from "jsonwebtoken"
const verifyToken = async(req,res,next)=>{
    try {
        const authHeader = req.headers.authorization
        const bearerToken = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null
        const token = bearerToken || req.cookies.token
        if(!token){
            return res.status(400).json({message:"token not found"})
        }
        const decodeToken = jwt.verify(token,process.env.SECRETKEY)
        if(!decodeToken){
            return res.status(400).json({message:"token not verified"})
        }
        //console.log(decodeToken)
        req.userId = decodeToken.userId
        next()
    } catch (error) {

        return res.status(500).json({message:"VerifyToken Error"})
        
    }
}

export default verifyToken