import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Truck } from "lucide-react";

interface ShippingOption {
  type: string;
  label: string;
  price: number;
  priceMax?: number;
}

interface ProductDetailTabsPanelProps {
  description?: string;
  shippingOptions?: ShippingOption[];
}

export default function ProductDetailTabsPanel({ description, shippingOptions }: ProductDetailTabsPanelProps) {
  return (
    <Card>
      <Tabs defaultValue="description">
        <CardHeader className="pb-0">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Deskripsi</TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1">Pengiriman</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Ulasan</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="description" className="mt-0">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{description}</p>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-0">
            <div className="space-y-4">
              {shippingOptions?.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    {option.type === "gratis" ? (
                      <Badge className="bg-primary-500">GRATIS</Badge>
                    ) : (
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{option.label}</p>
                      {option.type === "delivery" && option.priceMax && (
                        <p className="text-sm text-muted-foreground">
                          Estimasi ongkir: Rp {option.price.toLocaleString("id-ID")} - Rp {option.priceMax.toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium">
                    {option.price === 0 ? "Gratis" : `Rp ${option.price.toLocaleString("id-ID")}`}
                  </p>
                </div>
              ))}
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
                            className={`h-3 w-3 ${star <= 4 - i ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Barang sesuai deskripsi, pengiriman cepat. Recommended seller!</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
