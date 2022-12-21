import jwt from "jsonwebtoken"

import { User } from "../models/users.js"

export const isAuthenticated = async (req,res,next)=>{
    try {
        const {token} = req.cookies

        if(!token){return res.status(401).json({success:false, message:"login first"})}

        const decoded = await jwt.verify(token, "anshulnagpure")

        req.user = await User.findById(decoded._id)
        next()
    } catch (error) {
        res.status(500).json({success:false, messsage:error.message})
    }
}