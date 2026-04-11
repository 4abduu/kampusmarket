import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3x3, List, Search } from "lucide-react";

interface FavoritesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  typeFilter: "all" | "barang" | "jasa";
  setTypeFilter: (value: "all" | "barang" | "jasa") => void;
  sortBy: "terbaru" | "termurah" | "termahal" | "rating" | "terpopuler";
  setSortBy: (value: "terbaru" | "termurah" | "termahal" | "rating" | "terpopuler") => void;
  viewMode: "grid" | "list";
  setViewMode: (value: "grid" | "list") => void;
}

export default function FavoritesFilterBar({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: FavoritesFilterBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari favorit, seller, atau kategori..."
          className="h-9 pl-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="barang">Barang</SelectItem>
            <SelectItem value="jasa">Jasa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-[165px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="terbaru">Terbaru</SelectItem>
            <SelectItem value="rating">Rating tertinggi</SelectItem>
            <SelectItem value="terpopuler">Paling dilihat</SelectItem>
            <SelectItem value="termurah">Termurah</SelectItem>
            <SelectItem value="termahal">Termahal</SelectItem>
          </SelectContent>
        </Select>
        <div className="hidden rounded-lg border border-slate-200 p-0.5 dark:border-slate-700 sm:flex">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-8 w-8"><Grid3x3 className="h-3.5 w-3.5" /></Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="h-8 w-8"><List className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
