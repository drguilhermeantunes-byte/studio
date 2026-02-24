'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
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
import { RotateCcw, Volume2, Play, Loader2 } from 'lucide-react';
import { resetHistory } from '@/app/panel/actions';
import { useToast } from '@/hooks/use-toast';

export function TvDisplay() {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [lastAnnouncedId, setLastAnnouncedId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isStarted) return;

    const q = query(
      collection(db, 'calls'),
      orderBy('timestamp', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const calls: Call[] = [];
      querySnapshot.forEach((doc) => {
        calls.push({ id: doc.id, ...doc.data() } as Call);
      });

      const newCurrentCall = calls.length > 0 ? calls[0] : null;
      setCurrentCall(newCurrentCall);
      setCallHistory(calls.length > 1 ? calls.slice(1) : []);
    });

    return () => unsubscribe();
  }, [isStarted]);

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
          console.error("Failed to generate or speak announcement:", error);
          toast({
            title: 'Erro de Áudio',
            description: 'Não foi possível gerar o anúncio por voz.',
            variant: 'destructive',
          });
          setIsAnnouncing(false);
        }
      }
    };

    if (isStarted) {
      announceCall();
    }
  }, [currentCall, lastAnnouncedId, isStarted, toast]);

  const handleResetHistory = async () => {
    const result = await resetHistory();
    if (result.success) {
      toast({
        title: 'Sucesso',
        description: result.success,
      });
    } else {
      toast({
        title: 'Erro',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (!isStarted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Button size="lg" className="h-20 text-2xl" onClick={() => setIsStarted(true)}>
          <Play className="mr-4 h-8 w-8" /> Iniciar Display
        </Button>
      </div>
    );
  }

  return (
    <div className="grid h-screen w-screen grid-cols-1 grid-rows-[auto_1fr] bg-background text-foreground md:grid-cols-[4fr_1fr] md:grid-rows-1">
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
      <section className="flex flex-col items-center justify-center border-b-8 border-primary bg-background p-4 sm:p-8 md:border-b-0 md:border-r-8">
        <div className="flex w-full flex-col items-center justify-center text-center">
          {currentCall ? (
            <>
              <h1 className="text-7xl font-black uppercase tracking-wider text-primary sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] leading-none">
                {currentCall.patientName}
              </h1>
              <div className="mt-12 flex w-full flex-col items-center justify-center gap-4 text-foreground">
                <div className="flex items-center gap-4">
                  {isAnnouncing ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  ) : (
                    <Volume2 className="h-12 w-12 text-primary" />
                  )}
                  <p className="text-5xl font-bold uppercase md:text-6xl">
                    Sala
                  </p>
                </div>
                <div className="mt-2 rounded-2xl border-4 border-primary bg-primary/10 px-12 py-2 md:px-16 md:py-4">
                  <p className="font-mono text-8xl font-bold text-primary md:text-9xl">
                    {currentCall.roomNumber}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-4xl font-medium text-muted-foreground md:text-6xl">
              Aguardando chamada...
            </div>
          )}
        </div>
      </section>

      {/* Sidebar Section */}
      <aside className="flex flex-col bg-card p-6">
        <header className="flex items-center justify-between border-b-2 border-primary/50 pb-4">
          <div className="flex items-center gap-4">
            <Logo className="h-10 w-10 text-primary md:h-12 md:w-12" />
            <h2 className="text-3xl font-bold text-primary md:text-4xl">UBS Taboão</h2>
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
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-background p-3"
                >
                  <span className="text-xl font-semibold">{call.patientName}</span>
                  <span className="rounded-md bg-primary/20 px-3 py-1 text-base font-bold text-primary">
                    SALA {call.roomNumber}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-base text-muted-foreground">Nenhuma chamada no histórico.</p>
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
