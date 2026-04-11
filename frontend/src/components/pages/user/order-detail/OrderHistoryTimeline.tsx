import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Clock, Info, User } from "lucide-react";

import type { OrderHistory } from "@/lib/mock-data";

type StatusConfig = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: ComponentType<{ className?: string }>;
};

type OrderHistoryTimelineProps = {
  isService: boolean;
  orderHistory: OrderHistory[];
  expandedHistory: string[];
  toggleHistoryExpand: (id: string) => void;
  getStatusConfig: (status: string) => StatusConfig;
  formatShortDate: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  sellerId: string;
  buyerId: string;
};

export default function OrderHistoryTimeline({
  isService,
  orderHistory,
  expandedHistory,
  toggleHistoryExpand,
  getStatusConfig,
  formatShortDate,
  formatDate,
  sellerId,
  buyerId,
}: OrderHistoryTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Riwayat {isService ? "Booking" : "Pesanan"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-1">
            {orderHistory.map((history, index) => {
              const config = getStatusConfig(history.status);
              const Icon = config.icon;
              const isExpanded = expandedHistory.includes(history.id);
              const isLatest = index === orderHistory.length - 1;

              return (
                <div key={history.id} className="relative">
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleHistoryExpand(history.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-start gap-4 py-3 px-2 -mx-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 transition-all ${
                            isLatest
                              ? `${config.bgColor} ring-2 ring-offset-2 ring-offset-background ${config.borderColor}`
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${isLatest ? config.color : "text-muted-foreground"} ${history.status === "processing" && isLatest ? "animate-spin" : ""}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-medium ${isLatest ? config.color : ""}`}>
                              {config.label}
                            </p>
                            {isLatest && (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${config.bgColor} ${config.color}`}
                              >
                                Terbaru
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatShortDate(history.createdAt)}
                          </p>
                        </div>

                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="ml-12 mt-1 mb-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {history.actorName && (
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${history.actorId === "system" ? "bg-slate-300 dark:bg-slate-600" : "bg-primary-100 dark:bg-primary-900"}`}
                            >
                              {history.actorId === "system" ? (
                                <Info className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                              ) : (
                                <User className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{history.actorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {history.actorId === sellerId
                                ? `(${isService ? "Penyedia" : "Penjual"})`
                                : history.actorId === buyerId
                                  ? `(${isService ? "Pemesan" : "Pembeli"})`
                                  : ""}
                            </span>
                          </div>
                        )}

                        {history.notes && (
                          <p className="text-sm text-muted-foreground">{history.notes}</p>
                        )}

                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(history.createdAt)}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
