"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Edit, MessageSquare, Package, Star } from "lucide-react"


interface UserProfile {
  firstname: string;
  lastname: string;

}

export default function ProfilePage() {

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_USER_URL as string, { credentials: "include" });
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);


  const getInitials = (firstname?: string, lastname?: string): string => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
    }
    return '??';
  }
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
                {}
                <AvatarImage src="/placeholder.svg" alt="Profile picture" />
                <AvatarFallback>
                  {isLoading ? '...' : getInitials(profile?.firstname, profile?.lastname)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-bold">
                  {isLoading ? 'Loading...' : error ? 'Error loading name' : `${profile?.firstname || ''} ${profile?.lastname || ''}`}
                </h3>
                {}
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
                  <span className="text-sm font-medium">Sept 2023</span>
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
