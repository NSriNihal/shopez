import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production"

    return {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}
//Authntication controllers
export const signUp = async(req,res) =>{
    try{
        const {fullName, email ,password,mobile,role} = req.body
        let user = await User.findOne({email})

        if(user){
            return res.status(400).json({message:"User already exists"})
        }
        if(password.length<6){
            return res.status(400).json({message:"password must be atleast 6 letters"})
        }
        if(mobile.length<10){
            return res.status(400).json({message:"invalid mobile number"})
        }


        //hashing password
        const hashedPassword = await bcrypt.hash(password,10)
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password:hashedPassword
        })
        const token = await genToken(user._id)
        res.cookie("token", token, getCookieOptions())

        return res.status(200).json({
            message: "User created successfully",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            }
        })
    }
    catch(error){
        return res.status(500).json(error)
    }
}

export const signIn = async(req,res) =>{
    try{
        const {email ,password} = req.body
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message:"User not found SignUP first"})
        }
        
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Incorrect Password"})
        }

        

        const token = await genToken(user._id)
        res.cookie("token", token, getCookieOptions())

        return res.status(200).json({
            message: "Signin successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            }
        })
    }
    catch(error){
        return res.status(500).json(error)
    }
}

export const signOut = async(req,res) =>{
    try {
        res.clearCookie("token", getCookieOptions())
        return res.status(200).json({message:"logout Successfull"})
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({ authenticated: true, user })
    } catch (error) {
        return res.status(500).json({ message: "checkAuth error" })
    }
}