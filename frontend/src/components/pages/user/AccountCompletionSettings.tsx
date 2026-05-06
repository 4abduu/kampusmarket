"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Building2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface AccountCompletionSettings {
  isEmailVerified: boolean;
  hasFaculty: boolean;
  requiresEmailVerification: boolean;
  requiresFacultySelection: boolean;
  isComplete: boolean;
}

interface AccountCompletionSettingsComponentProps {
  onNavigate: (page: string) => void;
}

export default function AccountCompletionSettings({
  onNavigate,
}: AccountCompletionSettingsComponentProps) {
  const [status, setStatus] = useState<AccountCompletionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkCompletion();
  }, []);

  const checkCompletion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-completion`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal memuat status");
        return;
      }

      setStatus(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || "Gagal memuat status akun"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Kelengkapan Akun</h2>
        <p className="text-muted-foreground">
          Lengkapi informasi akun Anda untuk mengakses semua fitur KampusMarket
        </p>
      </div>

      {/* Email Verification Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  status.isEmailVerified
                    ? "bg-green-100 text-green-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {status.isEmailVerified ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Mail className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Verifikasi Email</CardTitle>
                <CardDescription>
                  {status.isEmailVerified
                    ? "Email Anda sudah terverifikasi"
                    : "Verifikasi email Anda untuk keamanan akun"}
                </CardDescription>
              </div>
            </div>
            {status.isEmailVerified && (
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                Terverifikasi
              </div>
            )}
          </div>
        </CardHeader>

        {!status.isEmailVerified && (
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email belum diverifikasi</p>
                  <p className="text-xs mt-1">Klik tombol di bawah untuk memulai proses verifikasi email</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => onNavigate("email-verification")}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Verifikasi Email
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Faculty Selection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  status.hasFaculty
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {status.hasFaculty ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Pilih Fakultas</CardTitle>
                <CardDescription>
                  {status.hasFaculty
                    ? "Fakultas Anda sudah dipilih"
                    : "Pilih fakultas Anda untuk personalisasi pengalaman"}
                </CardDescription>
              </div>
            </div>
            {status.hasFaculty && (
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                Selesai
              </div>
            )}
          </div>
        </CardHeader>

        {!status.hasFaculty && (
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Pilihan fakultas tidak dapat diubah kemudian</p>
                  <p className="text-xs mt-1">Pastikan Anda memilih fakultas yang benar sebelum menyimpan</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => onNavigate("faculty-selection")}
              className="w-full"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Pilih Fakultas
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Completion Status */}
      {status.isComplete && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Akun Anda sudah lengkap!</p>
              <p className="text-sm mt-1">Email terverifikasi dan fakultas dipilih. Anda siap untuk menggunakan semua fitur KampusMarket.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
