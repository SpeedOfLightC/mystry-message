import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

interface EmailFormat {
    email: string,
    username: string,
    verifyCode: string
}

export const sendVerificationEmail = async (incoming: EmailFormat): Promise<ApiResponse> => {
    const { email, username, verifyCode } = incoming;

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'mystry-message: Verification Code',
            react: VerificationEmail({ username, otp: verifyCode }),
        });

        return {
            success: true,
            message: "Verification email sent successfully"
        }
    } catch (emailError) {
        console.error("Error sending verification email: ", emailError);
        return {
            success: false,
            message: "Error sending verification email"
        }
    }
}


