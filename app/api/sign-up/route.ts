import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request){
    await dbConnect()

    try{
        const{username, email, phone, password} = await request.json()
       const existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerified: true
        })
        if (existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status:400})
        }


       const existingUserdByEmail = await UserModel.findOne({
            email
             })

             const verifyCode = Math.floor(100000 + Math.random()*900000).toString()

            if(existingUserdByEmail) {
                if (existingUserdByEmail.isVerified) {
                return Response.json({
                success: false,
                message: "User already exists with this email"
                }, {status:400})
                } else{
                    const hasedPassword =await bcrypt.hash(password, 10)
                    existingUserdByEmail.password = hasedPassword;
                    existingUserdByEmail.phone = phone;
                    existingUserdByEmail.verifyCode = verifyCode;
                    existingUserdByEmail.verifyCodeExpiry = new Date(Date.now()+3600000)
                    await existingUserdByEmail.save()
                }
            } else{
                const hasedPassword = await bcrypt.hash(password,10)
                const expiryDate =new Date()
                expiryDate.setHours(expiryDate.getHours()+1)
              const newUser=  new UserModel({
                     email,
                     phone,
                     username,
                    password: hasedPassword,
                    verifyCode,
                    verifyCodeExpiry: expiryDate,
                    isVerified: false
                })

                await newUser.save()
            }

            // sendverification email
            const emailResponse =await sendVerificationEmail(
                email,
                phone,
                username,
                verifyCode
            )

            if (!emailResponse.success) {
                return Response.json({
                success: false,
                message: emailResponse.message
                }, {status:500})
            }

            return Response.json({
                success: true,
                message: "User Registered successfuly. Please verify your email"
                }, {status:201})
             
       
    }
    catch(error){
        console.error("Error registering user", error)
        return Response.json(
            {
                success: false,
                message: "Error regustering user"
            },
            {
                status: 500
            }
        )
    }
}