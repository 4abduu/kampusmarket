"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Mail, Lock, Eye, EyeOff, AlertCircle, Ban, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface LoginPageProps {
  onNavigate: (page: string, data?: { userName?: string; userEmail?: string }) => void;
  onLogin: (role?: "user" | "admin") => void;
  onGooglePendingSelection: (session: {
    token: string;
    tokenType: string;
    userName?: string;
    userEmail?: string;
  }) => void;
}

export default function LoginPage({ onNavigate, onLogin, onGooglePendingSelection: _onGooglePendingSelection }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [bannedReason, setBannedReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setBannedReason(result.message);
          setShowBannedModal(true);
          return;
        }
        throw new Error(result.message || "Login gagal");
      }

      if (!result.success) {
        throw new Error(result.message || "Login gagal");
      }

      const authData = result.data;
      // Auth token is now stored as HttpOnly cookie automatically by the backend
      // No need to store in localStorage

      onLogin(authData?.user?.role === "admin" ? "admin" : "user");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login - Real Google OAuth flow
  const handleGoogleLogin = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      window.location.href = `${API_BASE_URL}/auth/google/redirect`;
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : "Login Google gagal");
    } finally {
      setIsGoogleLoading(false);
    }
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
            <Button 
              variant="outline" 
              className="w-full" 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa Google...
                </>
              ) : (
                <>
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
                </>
              )}
            </Button>

            {googleError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {googleError}
              </div>
            )}

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

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

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
                    disabled={isLoading}
                    required
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
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
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

              <Button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sedang Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            {/* <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs space-y-2">
              <p className="font-medium text-muted-foreground">📍 Tester? Hubungi admin untuk kode test akun</p>
              <p className="text-muted-foreground text-[11px]">
                Saat staging/development, admin akan memberikan test email & password untuk testing.
              </p>
            </div> */}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{bannedReason}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Jika merasa ada kesalahan, silakan hubungi support kami.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowBannedModal(false)}
              >
                Tutup
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
