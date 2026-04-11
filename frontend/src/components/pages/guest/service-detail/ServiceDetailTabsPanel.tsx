import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

interface ServiceDetailTabsPanelProps {
  description?: string;
}

export default function ServiceDetailTabsPanel({ description }: ServiceDetailTabsPanelProps) {
  return (
    <Card>
      <Tabs defaultValue="description">
        <CardHeader className="pb-0">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Deskripsi</TabsTrigger>
            <TabsTrigger value="terms" className="flex-1">Syarat & Ketentuan</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Ulasan</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="description" className="mt-0">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{description}</p>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="mt-0">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h4 className="font-medium mb-2">Syarat Pemesanan</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Bayar di muka atau via escrow</li>
                  <li>Komunikasi via chat untuk detail</li>
                  <li>Revisi sesuai kesepakatan</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h4 className="font-medium mb-2">Kebijakan Pembatalan</h4>
                <p className="text-sm text-muted-foreground">
                  Pembatalan dapat dilakukan sebelum pengerjaan dimulai dengan pengembalian dana penuh.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">U{i + 1}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">User {i + 1}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= 5 - i ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Pelayanan sangat memuaskan, hasil sesuai ekspektasi. Recommended!</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
