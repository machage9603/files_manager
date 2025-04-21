import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Get the Authorization header
        const authHeader = request.headers.get("Authorization")

        if (!authHeader || !authHeader.startsWith("Basic ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Extract the base64 encoded credentials
        const base64Credentials = authHeader.split(" ")[1]

        // Forward the request to the backend API
        const response = await fetch(`${process.env.API_URL || "http://localhost:5000"}/connect`, {
            method: "GET",
            headers: {
                Authorization: `Basic ${base64Credentials}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json(errorData, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error in connect route:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
