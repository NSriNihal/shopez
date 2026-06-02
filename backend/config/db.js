import {connect} from "mongoose"

const connectDb = async()=>{
    const dbUrl = process.env.DB_URL
    if (!dbUrl) {
        throw new Error("DB_URL is missing in environment variables")
    }

    await connect(dbUrl)
    console.log("Atlas DB connected")
}

export default connectDb