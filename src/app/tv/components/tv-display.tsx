'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import type { Call } from '@/lib/types';
import { dynamicPatientAnnouncement } from '@/ai/flows/dynamic-patient-announcement';
import { generateSpeech } from '@/ai/flows/generate-speech';
import { Clock } from './clock';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TvDisplay() {
  const [lastAnnouncedId, setLastAnnouncedId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const callsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'calls'),
      orderBy('timestamp', 'desc'),
      limit(6)
    );
  }, [firestore]);

  const { data: calls } = useCollection<Call>(callsQuery);

  const currentCall = calls && calls.length > 0 ? calls[0] : null;
  const callHistory = calls && calls.length > 1 ? calls.slice(1) : [];

  useEffect(() => {
    const announceCall = async () => {
      if (currentCall && currentCall.id !== lastAnnouncedId) {
        setIsAnnouncing(true);
        setLastAnnouncedId(currentCall.id);
        try {
          const { announcementText } = await dynamicPatientAnnouncement({
            patientName: currentCall.patientName,
            roomNumber: currentCall.roomNumber,
          });

          const { audio } = await generateSpeech({ text: announcementText });

          setAudioUrl(audio);
        } catch (error) {
          console.error('Failed to generate or speak announcement:', error);
          toast({
            title: 'Erro de Áudio',
            description: 'Não foi possível gerar o anúncio por voz.',
            variant: 'destructive',
          });
          setIsAnnouncing(false);
        }
      }
    };

    announceCall();
  }, [currentCall, lastAnnouncedId, toast]);

  const handleResetHistory = async () => {
    try {
      if (!firestore) return;
      const callsCollection = collection(firestore, 'calls');
      const callsSnapshot = await getDocs(callsCollection);

      if (callsSnapshot.empty) {
        toast({
          title: 'Aviso',
          description: 'O histórico já estava vazio.',
        });
        return;
      }

      const batch = writeBatch(firestore);
      callsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      toast({
        title: 'Sucesso',
        description: 'Histórico de chamadas resetado com sucesso!',
      });
    } catch (error) {
      console.error('Error resetting history: ', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar o histórico.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid h-screen w-screen grid-rows-1 bg-background text-foreground lg:grid-cols-[1fr_400px]">
      {audioUrl && (
        <audio
          src={audioUrl}
          autoPlay
          onEnded={() => {
            setAudioUrl(null);
            setIsAnnouncing(false);
          }}
          onError={() => {
            setIsAnnouncing(false);
            toast({
              title: 'Erro de Áudio',
              description: 'Falha ao reproduzir o som.',
              variant: 'destructive',
            });
          }}
        />
      )}

      {/* Main Call Section */}
      <section className="flex flex-col items-center justify-center p-8">
        <div className="flex w-full flex-col items-center justify-center text-center">
          {currentCall ? (
            <>
              <h2 className="text-5xl font-semibold uppercase tracking-wider text-muted-foreground">
                Paciente
              </h2>
              <h1 className="mt-4 text-[10rem] font-black leading-none tracking-tight text-primary lg:text-[14rem]">
                {currentCall.patientName}
              </h1>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 text-foreground">
                <div className="flex items-center gap-4">
                  {isAnnouncing ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  ) : (
                    <Volume2 className="h-12 w-12 text-primary" />
                  )}
                  <p className="text-6xl font-bold uppercase">Sala</p>
                </div>
                <div className="mt-2 rounded-2xl bg-primary px-16 py-4 shadow-lg">
                  <p className="font-mono text-9xl font-bold text-primary-foreground">
                    {currentCall.roomNumber}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-5xl font-semibold text-muted-foreground">
              Aguardando chamada...
            </div>
          )}
        </div>
      </section>

      {/* Sidebar Section */}
      <aside className="hidden flex-col border-l-2 border-border/50 bg-secondary/40 p-6 lg:flex">
        <header className="flex items-center justify-between border-b-2 border-border pb-4">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-12 text-primary" />
            <h2 className="text-4xl font-bold text-primary">UBS São Roque</h2>
          </div>
          <Clock />
        </header>

        <div className="mt-8 flex-grow">
          <h3 className="mb-4 text-2xl font-bold text-foreground">
            Últimas Chamadas
          </h3>
          <ul className="space-y-4">
            {callHistory.length > 0 ? (
              callHistory.map((call) => (
                <li
                  key={call.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-background p-3 shadow-sm"
                >
                  <span className="text-xl font-semibold">
                    {call.patientName}
                  </span>
                  <span className="rounded-md bg-primary/20 px-3 py-1 text-base font-bold text-primary">
                    SALA {call.roomNumber}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-base text-muted-foreground">
                Nenhuma chamada no histórico.
              </p>
            )}
          </ul>
        </div>

        <footer className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Resetar Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os registros de chamadas
                  serão excluídos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetHistory}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </footer>
      </aside>
    </div>
  );
}
