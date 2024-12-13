import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import bcrypt from "bcryptjs";


export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await req.json();

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken"
                },
                {
                    status: 400
                }
            )
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({
            email,
        })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "Email is already taken"
                    },
                    {
                        status: 400
                    }
                )
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserVerifiedByEmail.password = hashedPassword;
            existingUserVerifiedByEmail.verifyCode = verifyCode;
            existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

            await existingUserVerifiedByEmail.save();
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save();
        }

        // send verification email
        const emailResponse = await sendVerificationEmail({ email, username, verifyCode });

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "User registered successfully, please verify your email"
            },
            {
                status: 201
            }
        )

    } catch (error) {
        console.error("Error in signup route", error);
        return Response.json(
            {
                success: false,
                message: "Error in signup route"
            },
            {
                status: 500
            }
        );
    }
}

