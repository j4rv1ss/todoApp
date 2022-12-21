import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary"
import fs from "fs"


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

         const avatar = req.files.avatar.tempFilePath;

        let user = await User.findOne({ email })

        if (user) { return res.status(400).json({ status: false, message: "User already exists" }) }

        const otp = Math.floor(Math.random()*1000000)

        const myCloud = await cloudinary.v2.uploader.upload(avatar,{
            folder:"todoApp"
        })

        fs.rmSync("./tmp" , {recursive:true})

        user = await User.create({ name, email, password, avatar:{public_id:myCloud.public_id,url:myCloud.secure_url}, otp, otp_expiry: new Date(Date.now() + 5 * 60 * 1000) })

        await sendMail(email, "verify your account", `Your OTP is ${otp}`)

        sendToken(res, user, 200, "OTP sent to your email,please verify your account")
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

export const verify = async (req,res) => {
    try {
        const otp = Number(req.body.otp) 

        const user = await User.findById(req.user._id)

        if(user.otp !== otp || user.otp_expiry < Date.now()){
            return res.status(400).json({success:false, message:"Invalid OTP or has been expired"})    
        }

         user.verified = true
         user.otp = null
        user.otp_expiry = null

        await user.save()

        sendToken(res,user,200,"Acccount verified")

    } catch (error) {
        
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // const {avatar} = req.files;

        const user = await User.findOne({ email }).select("+password")

        if (!user) { return res.status(400).json({ status: false, message: "Invalid Email or Password" }) }

  
         const isMatch = await user.comparePassword(password)

         if(!isMatch) {return res.status(400).json({success:false, message:"Invalid Email or Password"})}

        sendToken(res, user, 200, "Login Successful")
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

export const logout = (req,res) => {
    try {
        res.status(200)
        .cookie("token", null , {
          expires: new Date(Date.now())
        })
        .json({success:true, message:"Logged out successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

export const addTask = async (req,res) => {
    try {
       const {title, description} = req.body

       const user = await User.findById(req.user._id)

       user.tasks.push({
        title,
        description,
        completed:false,
        createdAt: new Date(Date.now())
       })

       await user.save()

       res.status(200).json({success:true, message:"task added successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

export const removeTask = async (req,res) => {
    try {
       const {taskId} = req.params

       const user = await User.findById(req.user._id)

       user.tasks = user.tasks.filter((task) => task._id.toString() !== taskId.toString())

       await user.save()

       res.status(200).json({success:true, message:"task removed successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

export const updateTask = async (req,res) => {
        try {
       const {taskId} = req.params;

       const user = await User.findById(req.user._id)


      user.task = await user.tasks.find((task) => task._id.toString() === taskId.toString())


       user.task.completed = !user.task.completed;

       await user.save()

       res.status(200).json({success:true, message:"task updated successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}


export const getMyProfile = async (req,res) => {
    try {
       const user = await User.findById(req.user._id)

       sendToken(res, user, 201, `welcome back ${user.name}`)

    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}


export const updateProfile = async (req,res) => {
    try {
       const user = await User.findById(req.user._id)

      const {name} = req.body

      const avatar = req.files.avatar.tempFilePath;
       
      if(name) user.name = name

      if(avatar){
      await cloudinary.v2.uploader.destroy(user.avatar.public_id)

      const myCloud = await cloudinary.v2.uploader.upload(avatar)

        fs.rmSync("./tmp" , {recursive:true})

        user.avatar = {
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
      }

      await user.save()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   

      res.status(201).json({success:true, message:"Profile updated successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

export const updatePassword = async (req,res) => {
    try {
       const user = await User.findById(req.user._id).select("+password")

      const {oldPassword, newPassword} = req.body

      if(!oldPassword || !newPassword) {
        return res.status(400).json({status:false, message:"Please enter all field"})
      }
       
      const isMatch = await user.comparePassword(oldPassword)
      
      if(!isMatch) {
        return res.status(400).json({status:false, message:"Invalid old password"})
      }

      user.password = newPassword

      await user.save()
      res.status(201).json({success:true, message:"Password updated successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}


export const forgotPassword = async (req,res) => {
    try {
      

      const {email} = req.body
      const user = await User.findOne({email})
      if(!user) {
        return res.status(400).json({status:false, message:"Invalid email"})
      }
      const otp = Math.floor(Math.random()*1000000)

      user.resetPasswordOtp = otp
      user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000

      await user.save()

      const message = `Your OTP for requesting the password ${otp}. If you did not request for this , plrase ignore this email`
     

      await sendMail(email, "Request for reseting Password", message)

      


      res.status(200).json({success:true, message:`OTP sent to ${email}`})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}



export const resetPassword = async (req,res) => {
    try {
      

      const {otp ,newPassword} = req.body
      const user = await User.findOne({resetPasswordOtp:otp,resetpassword:{$gt:Date.now()}}).select("+password")
      if(!user) {
        return res.status(400).json({status:false, message:"otp Invalid or has been expired."})
      }
       
      user.password = newPassword
      user.resetPasswordOtp = null
      user.resetPasswordOtpExpiry = null

      await user.save()

      res.status(200).json({success:true, message:"password changed successfully"})
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}