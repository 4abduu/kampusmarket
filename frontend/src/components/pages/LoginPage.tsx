"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Mail, Lock, Eye, EyeOff, AlertCircle, Ban, X } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string, data?: { userName?: string; userEmail?: string }) => void;
  onLogin: (role?: "user" | "admin") => void;
}

// Mock user database - simulating backend
const mockUserDB = {
  "google_user_new": {
    id: "google_123",
    name: "New Google User",
    email: "newgoogle@gmail.com",
    faculty: null, // Faculty not set yet
  },
  "google_user_existing": {
    id: "google_456",
    name: "Existing User",
    email: "existing@gmail.com",
    faculty: "filkom", // Faculty already set
  }
};

// Banned user data for demo
const bannedUser = {
  email: "banned@kampusmarket.id",
  name: "Riko Malang",
  reason: "Melakukan penipuan dengan menjual barang palsu sebagai barang original. Beberapa user melaporkan transaksi curang."
};

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showBannedModal, setShowBannedModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login - in real app this would call API
    // Check if banned user
    if (email === bannedUser.email) {
      setShowBannedModal(true);
      return;
    }
    // Check if admin credentials
    if (email === "admin@kampusmarket.id") {
      onLogin("admin");
    } else {
      onLogin("user");
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    // Simulate Google OAuth flow
    // In real implementation, this would:
    // 1. Redirect to Google OAuth
    // 2. Get user info from Google
    // 3. Check if user exists in database
    // 4. If faculty is null, redirect to faculty selection
    
    // For demo, we simulate a new Google user (faculty is null)
    // So we redirect to faculty selection page with mock Google user data
    const mockGoogleUser = {
      userName: "Budi Santoso",
      userEmail: "budi.santoso@gmail.com"
    };
    
    onNavigate("faculty-selection", mockGoogleUser);
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Selamat Datang Kembali!</CardTitle>
            <CardDescription>
              Masuk ke akun KampusMarket kamu
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Google Login */}
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </Button>

            {/* Info about Google login */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Untuk pengguna baru Google, kamu akan diminta memilih fakultas setelah login pertama kali.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  atau dengan email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("forgot-password");
                  }}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Lupa password?
                </a>
              </div>

              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700">
                Masuk
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs space-y-2">
              <p className="font-medium text-muted-foreground">Demo Login (Klik untuk isi form):</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("user@student.ac.id");
                    setPassword("password");
                  }}
                  className="text-left p-2 rounded bg-white dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-slate-600 transition-colors border-2 border-transparent hover:border-primary-300"
                >
                  <p className="font-medium text-primary-600">👤 User</p>
                  <p className="text-muted-foreground text-[10px]">user@student.ac.id</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@kampusmarket.id");
                    setPassword("admin123");
                  }}
                  className="text-left p-2 rounded bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-slate-600 transition-colors border-2 border-transparent hover:border-amber-300"
                >
                  <p className="font-medium text-amber-600 flex items-center gap-1">
                    🛡️ Admin
                  </p>
                  <p className="text-muted-foreground text-[10px]">admin@kampusmarket.id</p>
                </button>
              </div>
              {/* Banned user demo */}
              <button
                type="button"
                onClick={() => {
                  setEmail(bannedUser.email);
                  setPassword("banned123");
                }}
                className="w-full text-left p-2 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border-2 border-transparent hover:border-red-300"
              >
                <p className="font-medium text-red-600 flex items-center gap-1">
                  🚫 User Banned
                </p>
                <p className="text-muted-foreground text-[10px]">{bannedUser.email}</p>
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <a
                href="#register"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("register");
                }}
                className="text-primary-600 hover:underline font-medium"
              >
                Daftar Sekarang
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Banned User Modal */}
      {showBannedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Ban className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-600">Akun Diblokir</CardTitle>
              <CardDescription>
                Akun kamu telah diblokir oleh administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Alasan Pemblokiran:
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {bannedUser.reason}
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Email:</span> {bannedUser.email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Nama:</span> {bannedUser.name}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Jika kamu merasa ini adalah kesalahan, silakan hubungi admin melalui email admin@kampusmarket.id untuk mengajukan banding.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  setShowBannedModal(false);
                  setEmail("");
                  setPassword("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Tutup
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
