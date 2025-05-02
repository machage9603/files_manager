"use client"

// Keep necessary React and Next.js imports
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
// Keep your UI component imports
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Loader2 } from "lucide-react"

// --- Firebase Import ---
// Import the necessary function and auth instance from your client-side Firebase setup file.
import { auth } from "@/lib/firebase/clientApp"; // Import the auth instance
import { signInWithEmailAndPassword } from "firebase/auth"; // Import the login function
// --- End Firebase Import ---


export default function LoginPage() {
  // Keep state variables and router
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Prevent default form submission
    setIsLoading(true) // Start loading state
    setError("") // Clear previous errors

    // Get email and password from the form
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // --- Firebase Auth Login Logic ---
    try {
      // Instead of creating a basic auth token and fetching your API,
      // call the Firebase Auth function to sign the user in.
      // This function securely communicates with the Firebase backend.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // On successful login, Firebase automatically manages the user session.
      // You don't need to manually store a token in localStorage for basic session management.
      const user = userCredential.user;
      console.log("Successfully signed in user:", user);

      // Redirect to the dashboard after successful login.
      router.push("/dashboard");

    } catch (firebaseError: any) {
      // Catch errors specifically from Firebase Auth.
      // Use Firebase error codes to provide specific feedback to the user.
      console.error("Firebase login error:", firebaseError);

      let errorMessageToShow = "An unexpected error occurred during sign in.";

      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessageToShow = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          errorMessageToShow = 'The email address is invalid.';
          break;
         case 'auth/user-disabled':
            errorMessageToShow = 'This user account has been disabled.';
            break;
        default:
          errorMessageToShow = firebaseError.message || 'Sign in failed. Please try again.'; // Fallback to Firebase message
          break;
      }

      setError(errorMessageToShow); // Set the error state with a user-friendly message
    } finally {
      setIsLoading(false); // End loading state regardless of success or failure
    }
    // --- End Firebase Auth Login Logic ---
  }

  // Rest of your JSX remains the same for rendering the form
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your files</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
