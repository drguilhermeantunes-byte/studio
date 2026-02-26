'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Call } from "@/lib/types";
import { Repeat } from "lucide-react";

interface RecentCallsProps {
    calls: Call[] | null;
    loading: boolean;
    onCallSelect: (call: Call) => void;
}

export function RecentCalls({ calls, loading, onCallSelect }: RecentCallsProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    if (!calls || calls.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed">
                <p className="text-sm text-muted-foreground">Nenhuma chamada recente.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[450px] lg:h-[500px]">
            <div className="space-y-3 pr-4">
                {calls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between gap-4 rounded-lg bg-secondary/50 p-3">
                        <div className="flex-grow overflow-hidden">
                            <p className="truncate font-semibold text-secondary-foreground">{call.patientName}</p>
                            <p className="truncate text-sm text-muted-foreground">
                                Sala {call.roomNumber}
                                {call.professionalName && ` - ${call.professionalName}`}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => onCallSelect(call)}
                            aria-label={`Re-chamar ${call.patientName}`}
                            title={`Re-chamar ${call.patientName}`}
                        >
                            <Repeat className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
