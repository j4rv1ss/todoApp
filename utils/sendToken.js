export const sendToken = (res,user,statusCode,message) => {

const token = user.getJWTToken()
    const options = {
        httpOnly:true,
        expires: new Date(Date.now()+10*24*60*60*1000)
    }

    const userData = {
        _id: user._id,
        name:user.name,
        email:user.email,                                                                                                                                                                                                                                          
        password:user.password,
        avatar:user.avatar,
        tasks:user.tasks,
        verified: user.verified
    }

    res.status(statusCode).cookie("token",token,options).json({success:true, message, user:userData})
}