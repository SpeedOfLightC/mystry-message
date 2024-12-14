import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signupSchema";
import { z } from "zod";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();
    // localhost:3000/api/check-username-unique?username=arnab
    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log(result);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: usernameErrors[0] || "Invalid username"
                },
                {
                    status: 400
                }
            )
        }

        const { username } = result.data;

        const existedUser = await UserModel.findOne({
            username,
            isVerified: true
        });

        if (existedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exist"
                },
                {
                    status: 400
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Username available"
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("Error in check-username-unique route: ", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred while checking the username"
            },
            {
                status: 500
            }
        )
    }
}