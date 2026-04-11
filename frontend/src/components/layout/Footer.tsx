"use client";

import type { MouseEvent, ReactNode } from "react";
import { Package, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  onNavigate: (page: string) => void;
}

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNavClick = (page: string, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <a href="#" onClick={(e) => handleNavClick("landing", e)} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">KampusMarket</span>
            </a>
            <p className="text-sm text-slate-400">
              Platform marketplace hyperlocal untuk mahasiswa, alumni, dan masyarakat sekitar kampus. 
              Jual beli barang bekas dan jasa dengan mudah.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" title="Facebook" className="hover:text-primary-400 transition-colors">
                <SocialIcon>
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.19 2.23.19v2.46h-1.25c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12" />
                </SocialIcon>
              </a>
              <a href="#" aria-label="Instagram" title="Instagram" className="hover:text-primary-400 transition-colors">
                <SocialIcon>
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2m0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5z" />
                  <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5" />
                  <circle cx="17.25" cy="6.75" r="1" />
                </SocialIcon>
              </a>
              <a href="#" aria-label="Twitter" title="Twitter" className="hover:text-primary-400 transition-colors">
                <SocialIcon>
                  <path d="M21.5 5.9c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.2 1.6-2.1-.7.4-1.5.8-2.4.9A3.7 3.7 0 0 0 12 8.2c0 .3 0 .6.1.8A10.5 10.5 0 0 1 4.5 5.1c-.3.5-.5 1.1-.5 1.8 0 1.3.7 2.5 1.8 3.2-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.4 3 3.8-.3.1-.7.2-1 .2-.2 0-.5 0-.7-.1.5 1.5 1.9 2.6 3.6 2.6A7.5 7.5 0 0 1 4 17.8 10.6 10.6 0 0 0 9.8 19c6.9 0 10.7-5.7 10.7-10.7v-.5c.7-.5 1.4-1.1 1.9-1.9z" />
                </SocialIcon>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menu Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#catalog"
                  onClick={(e) => handleNavClick("catalog", e)}
                  className="hover:text-primary-400 transition-colors"
                >
                  Katalog Barang
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick("services", e)}
                  className="hover:text-primary-400 transition-colors"
                >
                  Layanan Jasa
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavClick("landing", e)}
                  className="hover:text-primary-400 transition-colors"
                >
                  Cara Kerja
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavClick("register", e)}
                  className="hover:text-primary-400 transition-colors"
                >
                  Mulai Berjualan
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Panduan Keamanan
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span>support@kampusmarket.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary-500 mt-0.5" />
                <span>Jl. Kampus No. 123, Kota Padang, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>&copy; 2024 KampusMarket. Hak cipta dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-400 transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
