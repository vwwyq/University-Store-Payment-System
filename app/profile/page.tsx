"use client"
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"; // Added missing import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Edit, MessageSquare, Package, Star } from "lucide-react"

interface UserProfile {
  success?: boolean;
  id?: string;
  uid?: string;
  firstName?: string; // Using camelCase as expected by the component
  lastName?: string;  // Using camelCase as expected by the component
  balance?: string;
  registrationDate?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
  
      try {
        // Check both localStorage and sessionStorage for the token
        const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken');
        console.log("Token from storage:", token ? "Present" : "Not found");
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, { 
          credentials: "include", // Include cookies
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error("Authentication failed. Redirecting to login...");
            // Clear any invalid tokens
            sessionStorage.removeItem('jwtToken');
            localStorage.removeItem('jwtToken');
            router.push("/login");
            return;
          }
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Profile data received:", data);
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch profile data");
        }
        
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [router]); // Added router to dependency array

  const getInitials = (firstName?: string, lastName?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return '??';
  }

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile/settings">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_3fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="Profile picture" />
                <AvatarFallback>
                  {isLoading ? '...' : getInitials(profile?.firstName, profile?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-bold">
                  {isLoading ? 'Loading...' : 
                   error ? 'Error loading profile' : 
                   profile?.firstName && profile?.lastName ? 
                   `${profile.firstName} ${profile.lastName}` : 'Name Not Available'}
                </h3>
                <p className="text-sm text-muted-foreground">Computer Science</p>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">(4.2)</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member since:</span>
                  <span className="text-sm font-medium">
                    {profile?.registrationDate ? formatDate(profile.registrationDate) : 'Sept 2023'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Balance:</span>
                  <span className="text-sm font-medium">${profile?.balance || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Items sold:</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Items purchased:</span>
                  <span className="text-sm font-medium">8</span>
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button className="flex-1" asChild>
                  <Link href="/profile/wallet">Wallet</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/profile/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="listings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="listings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Active Listings</CardTitle>
                  <CardDescription>Manage your current items for sale</CardDescription>
                </CardHeader>
                <CardContent>
                  {error ? <p className="text-red-500">Error loading listings: {error}</p> : 
                   isLoading ? <p>Loading your listings...</p> : 
                   <p>No active listings found</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Purchases</CardTitle>
                  <CardDescription>Items you've bought from other students</CardDescription>
                </CardHeader>
                <CardContent>
                  {error ? <p className="text-red-500">Error loading purchases: {error}</p> : 
                   isLoading ? <p>Loading your purchases...</p> : 
                   <p>No purchases found</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>What other students are saying about you</CardDescription>
                </CardHeader>
                <CardContent>
                  {error ? <p className="text-red-500">Error loading reviews: {error}</p> : 
                   isLoading ? <p>Loading your reviews...</p> : 
                   <p>No reviews found</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}