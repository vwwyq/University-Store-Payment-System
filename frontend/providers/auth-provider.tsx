"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// Define the user type
export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  university: string
  major?: string
  bio?: string
  profileImage?: string
  wallet?: {
    balance: number
  }
}

// Define the auth context type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data - replace with actual API calls in production
const mockUsers = [
  {
    id: "user1",
    email: "john.doe@kiit.ac.in",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    university: "KIIT University",
    major: "Computer Science",
    bio: "Computer Science student interested in web development and AI.",
    profileImage: "/placeholder.svg",
    wallet: {
      balance: 5000,
    },
  },
  {
    id: "user2",
    email: "jane.smith@kiit.ac.in",
    password: "password123",
    firstName: "Jane",
    lastName: "Smith",
    university: "KIIT University",
    major: "Business Administration",
    bio: "Business student looking for textbooks and study materials.",
    profileImage: "/placeholder.svg",
    wallet: {
      balance: 3500,
    },
  },
]

// Create the auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth_token")

      if (token) {
        // In a real app, you would validate the token with your backend
        // For now, we'll just use the mock data
        const userId = Cookies.get("user_id")
        const foundUser = mockUsers.find((u) => u.id === userId)

        if (foundUser) {
          // Remove password before setting user
          const { password, ...userWithoutPassword } = foundUser
          setUser(userWithoutPassword as User)
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // In a real app, you would call your API
      // For now, we'll just use the mock data
      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        // Remove password before setting user
        const { password, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword as User)

        // Set cookies
        Cookies.set("auth_token", "mock_token_" + foundUser.id, { expires: 7 })
        Cookies.set("user_id", foundUser.id, { expires: 7 })

        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  // Signup function
  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true)

    try {
      // In a real app, you would call your API
      // For now, we'll just pretend it worked
      const newUser = {
        id: "user" + (mockUsers.length + 1),
        ...userData,
        wallet: {
          balance: 0,
        },
      }

      // Remove password before setting user
      const { password, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword as User)

      // Set cookies
      Cookies.set("auth_token", "mock_token_" + newUser.id, { expires: 7 })
      Cookies.set("user_id", newUser.id, { expires: 7 })

      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Signup error:", error)
      setIsLoading(false)
      return false
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    Cookies.remove("auth_token")
    Cookies.remove("user_id")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

