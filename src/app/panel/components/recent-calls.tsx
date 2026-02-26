'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Call } from "@/lib/types";
import { Repeat, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { capitalizeName } from "@/lib/utils";

interface RecentCallsProps {
    calls: Call[] | null;
    loading: boolean;
    onCallSelect: (call: Call) => void;
    onDeleteCall: (call: Call) => void;
}

export function RecentCalls({ calls, loading, onCallSelect, onDeleteCall }: RecentCallsProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
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
                            <p className="truncate font-semibold text-secondary-foreground">{capitalizeName(call.patientName)}</p>
                            <p className="truncate text-sm text-muted-foreground">
                                Sala {call.roomNumber}
                                {call.professionalName && ` - ${call.professionalName}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {call.timestamp ? format(call.timestamp.toDate(), 'HH:mm:ss') : ''}
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0"
                                onClick={() => onCallSelect(call)}
                                aria-label={`Re-chamar ${capitalizeName(call.patientName)}`}
                                title={`Re-chamar ${capitalizeName(call.patientName)}`}
                            >
                                <Repeat className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0 text-destructive hover:text-destructive"
                                onClick={() => onDeleteCall(call)}
                                aria-label={`Deletar chamada de ${capitalizeName(call.patientName)}`}
                                title={`Deletar chamada de ${capitalizeName(call.patientName)}`}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
