"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase/clientApp";
import { createUserWithEmailAndPassword } from "firebase/auth";


export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Keep client-side password confirmation check
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // --- Firebase Auth Signup Logic ---
    try {
      // Call the Firebase Auth function to create a new user with email and password.
      // This function securely communicates with the Firebase backend.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // On successful creation, Firebase automatically signs the user in.
      const user = userCredential.user;
      console.log("Successfully signed up user:", user);

      // Instead of fetching your custom API, handle the success directly.
      // The original code redirects to /login, which is fine,
      // but note that the user is already logged in according to Firebase Auth state.
      router.push("/login?registered=true"); // Redirect after successful signup

    } catch (firebaseError: any) {
      // Catch errors specifically from Firebase Auth.
      // Firebase provides error codes and messages you can use.
      console.error("Firebase signup error:", firebaseError);

      // Provide user-friendly error messages based on Firebase error codes
      let errorMessageToShow = "An unexpected error occurred during signup.";

      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          errorMessageToShow = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessageToShow = 'The email address is invalid.';
          break;
        case 'auth/operation-not-allowed':
            errorMessageToShow = 'Email/password sign-in is not enabled. Please check Firebase Console.';
            break;
        case 'auth/weak-password':
          errorMessageToShow = 'The password is too weak.';
          break;
        default:
          errorMessageToShow = firebaseError.message || 'Signup failed. Please try again.'; // Fallback to Firebase message
          break;
      }

      setError(errorMessageToShow); // Set the error state with a user-friendly message
    } finally {
      setIsLoading(false); // End loading state regardless of success or failure
    }
    // --- End Firebase Auth Signup Logic ---
  }

  // Rest of your JSX remains the same for rendering the form
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
