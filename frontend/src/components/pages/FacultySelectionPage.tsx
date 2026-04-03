"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Check, Loader2, Sparkles, AlertTriangle, Ban } from "lucide-react";
import { faculties } from "@/lib/mock-data";

interface FacultySelectionPageProps {
  onNavigate: (page: string) => void;
  onLogin: (role?: "user" | "admin") => void;
  userName?: string;
  userEmail?: string;
}

export default function FacultySelectionPage({ onNavigate, onLogin, userName, userEmail }: FacultySelectionPageProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Display name from Google account or default
  const displayName = userName || "Mahasiswa Baru";

  const handleConfirm = async () => {
    if (!selectedFaculty) return;

    setIsLoading(true);
    
    // Simulate API call to save faculty
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Complete registration and login
    onLogin("user");
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/30 dark:bg-secondary-900/30 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-2xl border-2 border-primary-100 dark:border-primary-900/50">
        {/* Header with greeting */}
        <CardHeader className="text-center border-b pb-6">
          {/* User Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-primary-100 dark:ring-primary-900/50">
                <AvatarFallback className="text-lg font-semibold bg-primary-600 text-white">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          {/* Friendly greeting */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Halo, {displayName.split(" ")[0]}!
            </h2>
            <CardDescription className="text-base">
              Selamat datang di KampusMarket
            </CardDescription>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-6 space-y-5">
          {/* Info message */}
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Untuk menyelesaikan pendaftaran, silakan pilih fakultas Anda:
            </p>
          </div>

          {/* Faculty Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Fakultas <span className="text-red-500">*</span>
            </label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Pilih fakultas Anda..." />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {faculties.map((faculty) => (
                  <SelectItem 
                    key={faculty.id} 
                    value={faculty.id}
                    className="py-3 text-base"
                  >
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Danger Warning - More Prominent */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300 mb-1">
                  Pilihan Tidak Dapat Diubah!
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Fakultas hanya bisa dipilih <strong>satu kali</strong>. Pastikan Anda memilih fakultas yang benar sebelum menekan tombol konfirmasi.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Preview */}
          {selectedFaculty && (
            <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary-600 dark:text-primary-400">Fakultas terpilih</p>
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {faculties.find(f => f.id === selectedFaculty)?.name}
                </p>
              </div>
              <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col gap-3 border-t pt-4">
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700 h-12 text-base"
            size="lg"
            disabled={!selectedFaculty || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Selesaikan Pendaftaran
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
