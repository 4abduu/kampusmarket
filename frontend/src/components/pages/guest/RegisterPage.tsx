"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Mail, Lock, User, Eye, EyeOff, Phone, Building2, AlertCircle, Loader2, Check } from "lucide-react";
import { facultiesApi } from "@/lib/api/faculties";
import type { Faculty } from "@/components/pages/admin/admin-dashboard.shared";
import { API_BASE_URL } from "@/lib/config";
import type { NavigateFn } from "@/app/navigation/types";

interface RegisterPageProps {
  onNavigate: NavigateFn;
  onLogin: (role?: "user" | "admin") => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    faculty_id: "",
    agreeTerms: false,
  });

  useEffect(() => {
    facultiesApi
      .listDropdown()
      .then(setFaculties)
      .catch(() => setFaculties([]))
      .finally(() => setIsLoadingFaculties(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/auth/google/redirect`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Nama lengkap harus diisi");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email harus diisi");
      return;
    }

    if (formData.password.length < 8 || !/[0-9]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password)) {
      setError("Password minimal 8 karakter, minimal 1 huruf besar, huruf kecil, dan angka");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Anda harus menyetujui syarat dan ketentuan");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          facultyId: formData.faculty_id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registrasi gagal");
      }

      if (!result.success) {
        throw new Error(result.message || "Registrasi gagal");
      }

      onNavigate("email-verification", {
        registeredEmail: formData.email,
        emailVerificationSource: "register",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Bergabung dengan komunitas KampusMarket
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Register */}
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleRegister}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Daftar dengan Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">atau dengan email</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" name="name" type="text" placeholder="Masukkan nama lengkap" className="pl-10" value={formData.name} onChange={handleInputChange} disabled={isLoading} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
                <span className="text-amber-600 ml-1 text-xs">⚠️ Permanen!</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="nama@email.com" className="pl-10" value={formData.email} onChange={handleInputChange} disabled={isLoading} required />
              </div>
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Email bersifat permanen dan <strong>tidak dapat diubah</strong> setelah pendaftaran. Pastikan email yang dimasukkan sudah benar.</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP (WhatsApp)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" placeholder="08xx xxxx xxxx" className="pl-10" value={formData.phone} onChange={handleInputChange} disabled={isLoading} />
              </div>
            </div>

            {/* Faculty Selection - from API */}
            <div className="space-y-2">
              <Label htmlFor="faculty_id">
                Fakultas <span className="text-muted-foreground text-xs">(Opsional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  id="faculty_id"
                  name="faculty_id"
                  title="Pilih fakultas"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  value={formData.faculty_id}
                  onChange={handleInputChange}
                  disabled={isLoading || isLoadingFaculties}
                >
                  <option value="">{isLoadingFaculties ? "Memuat fakultas..." : "Pilih fakultas (atau pilih nanti)"}</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Anda dapat memilih atau mengubah fakultas nanti di pengaturan akun.</span>
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
                  className={`pl-10 pr-10 ${passwordError && formData.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setPasswordError("");
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Password harus memenuhi syarat:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { met: formData.password.length >= 8, label: "Minimal 8 karakter" },
                      { met: /[0-9]/.test(formData.password), label: "1 Angka" },
                      { met: /[a-z]/.test(formData.password), label: "1 Huruf kecil" },
                      { met: /[A-Z]/.test(formData.password), label: "1 Huruf besar" },
                    ].map(({ met, label }) => (
                      <div key={label} className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-primary-600" : "text-muted-foreground"}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? "bg-primary-100" : "bg-slate-100"}`}>
                          {met ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </div>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi password" className="pl-10 pr-10" value={formData.confirmPassword} onChange={handleInputChange} disabled={isLoading} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={formData.agreeTerms} onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })} />
              <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                Saya setuju dengan{" "}
                <a href="#" className="text-primary-600 hover:underline">Syarat & Ketentuan</a>
                {" "}dan{" "}
                <a href="#" className="text-primary-600 hover:underline">Kebijakan Privasi</a>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700" disabled={!formData.agreeTerms || isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sedang Mendaftar...</>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <a href="#login" onClick={(e) => { e.preventDefault(); onNavigate("login"); }} className="text-primary-600 hover:underline font-medium">
              Masuk di sini
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
