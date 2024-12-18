'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signupSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"


const page: React.FC = () => {

  const [username, setUsername] = useState<string>("");
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const [isChekingUsername, setIsChekingUsername] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const debounced = useDebounceCallback(setUsername, 300);
  const { toast } = useToast();
  const router = useRouter();

  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsChekingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`);
          console.log(response);
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          console.log("Error checking username unique", axiosError);
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username unique");
        } finally {
          setIsChekingUsername(false);
        }
      }
    }

    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    console.log(data);

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data);
      console.log(response);
      toast({
        title: "Success",
        description: response.data.message
      });

      router.replace(`/verify/${username}`)
    } catch (error) {
      console.error("Error signing up", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? "Error signing up";
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join Mystry Message
            </h1>
            <p className="mb-4">Sign up to start your anonymous adventure</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          debounced(e.target.value)
                        }}
                      />
                    </FormControl>
                    {
                      isChekingUsername && <Loader2 className="animate-spin" />
                    }
                    <p className={`text-sm ${usernameMessage === "Username is unique" ? "text-green-600" : "text-red-600"}`} >
                      {usernameMessage}
                    </p>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your email id to identify your account.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Make sure it's at least 8 characters including a number and a lowercase letter.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {
                  isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : ("Sign Up")
                }
              </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Already a member?{' '}
              <Link href="/signin" className="text-blue-600 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default page