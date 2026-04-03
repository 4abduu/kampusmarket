"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Mail, Lock, User, Eye, EyeOff, Phone, Building2, AlertCircle } from "lucide-react";

interface RegisterPageProps {
  onNavigate: (page: string, data?: { registeredEmail?: string }) => void;
  onLogin: (role?: "user" | "admin") => void;
}

const faculties = [
  { id: "vokasi", name: "Fakultas Vokasi" },
  { id: "feb", name: "Fakultas Ekonomi dan Bisnis (FEB)" },
  { id: "filkom", name: "Fakultas Ilmu Komputer (FILKOM)" },
  { id: "ft", name: "Fakultas Teknik (FT)" },
  { id: "fmipa", name: "Fakultas MIPA (FMIPA)" },
  { id: "fisip", name: "Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)" },
  { id: "fh", name: "Fakultas Hukum (FH)" },
  { id: "fk", name: "Fakultas Kedokteran (FK)" },
  { id: "fkh", name: "Fakultas Kedokteran Hewan (FKH)" },
  { id: "fapet", name: "Fakultas Peternakan (FAPET)" },
  { id: "fp", name: "Fakultas Pertanian (FP)" },
  { id: "fpi", name: "Fakultas Perikanan dan Ilmu Kelautan (FPI)" },
  { id: "fib", name: "Fakultas Ilmu Budaya (FIB)" },
  { id: "psdku", name: "PSDKU" },
  { id: "alumni", name: "Alumni" },
  { id: "masyarakat", name: "Masyarakat Umum" },
];

export default function RegisterPage({ onNavigate, onLogin }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    faculty: "",
    agreeTerms: false,
  });

  const handleGoogleRegister = () => {
    // Redirect to faculty selection for Google register flow
    onNavigate("faculty-selection");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to email verification with the registered email
    onNavigate("email-verification", { registeredEmail: formData.email });
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
            Daftar dengan Google
          </Button>

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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
                <span className="text-amber-600 ml-1 text-xs">⚠️ Permanen!</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
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
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xx xxxx xxxx"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Faculty Selection - ONCE ONLY */}
            <div className="space-y-2">
              <Label htmlFor="faculty">
                Fakultas
                <span className="text-amber-600 ml-1 text-xs">⚠️ Hanya bisa dipilih sekali!</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="faculty"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                >
                  <option value="">Pilih fakultas...</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Fakultas bersifat permanen dan tidak dapat diubah setelah pendaftaran.</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
              />
              <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                Saya setuju dengan{" "}
                <a href="#" className="text-primary-600 hover:underline">
                  Syarat & Ketentuan
                </a>{" "}
                dan{" "}
                <a href="#" className="text-primary-600 hover:underline">
                  Kebijakan Privasi
                </a>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700" disabled={!formData.agreeTerms}>
              Daftar
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("login");
              }}
              className="text-primary-600 hover:underline font-medium"
            >
              Masuk
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
