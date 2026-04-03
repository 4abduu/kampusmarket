"use client";

import type { MouseEvent } from "react";
import { Package, Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  onNavigate: (page: string) => void;
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
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" title="Instagram" className="hover:text-primary-400 transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" title="Twitter" className="hover:text-primary-400 transition-colors">
                <FaTwitter className="h-5 w-5" />
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
