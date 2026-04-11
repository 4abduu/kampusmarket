import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface SearchResultsPromptsProps {
  mode: "initial" | "empty";
  onSelectPrompt: (value: string) => void;
}

export default function SearchResultsPrompts({ mode, onSelectPrompt }: SearchResultsPromptsProps) {
  const prompts = mode === "empty"
    ? ["elektronik", "buku", "fotografi", "les"]
    : ["elektronik", "buku", "fotografi", "Adit"];

  return (
    <div className="text-center py-16">
      <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">
        {mode === "empty" ? "Tidak ada hasil ditemukan" : "Cari sesuatu"}
      </h2>
      <p className="text-muted-foreground mb-6">
        {mode === "empty"
          ? "Coba kata kunci lain atau periksa ejaan"
          : "Ketik kata kunci untuk mencari produk, jasa, atau pengguna"}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {prompts.map((prompt) => (
          <Badge
            key={prompt}
            variant="outline"
            className="cursor-pointer hover:bg-slate-100"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt.charAt(0).toUpperCase() + prompt.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
