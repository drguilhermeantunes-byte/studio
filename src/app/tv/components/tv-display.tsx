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
import { RotateCcw, Volume2, Play } from 'lucide-react';
import { resetHistory } from '@/app/panel/actions';
import { useToast } from '@/hooks/use-toast';

export function TvDisplay() {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [lastAnnouncedId, setLastAnnouncedId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
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
        try {
          const { announcementText } = await dynamicPatientAnnouncement({
            patientName: currentCall.patientName,
            roomNumber: currentCall.roomNumber,
          });

          const utterance = new SpeechSynthesisUtterance(announcementText);
          utterance.lang = 'pt-BR';
          utterance.volume = 1;
          utterance.rate = 1;

          // Try to find a female Portuguese voice
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(
            (voice) => voice.lang === 'pt-BR' && voice.name.includes('Feminino')
          );
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }

          window.speechSynthesis.speak(utterance);
          setLastAnnouncedId(currentCall.id);
        } catch (error) {
          console.error("Failed to generate or speak announcement:", error);
        }
      }
    };

    if (isStarted) {
      announceCall();
    }
  }, [currentCall, lastAnnouncedId, isStarted]);

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
    <div className="grid h-screen w-screen grid-cols-1 grid-rows-[auto_1fr] bg-background text-foreground md:grid-cols-[3fr_1fr] md:grid-rows-1">
      {/* Main Call Section */}
      <section className="flex flex-col items-center justify-center border-b-4 border-primary bg-card p-8 md:border-b-0 md:border-r-4">
        <div className="flex w-full flex-col items-center justify-center text-center">
          {currentCall ? (
            <>
              <p className="text-8xl font-extrabold tracking-tight text-primary lg:text-9xl">
                {currentCall.patientName}
              </p>
              <div className="mt-8 flex items-center gap-4 text-5xl font-medium text-foreground lg:text-6xl">
                <Volume2 className="h-16 w-16 text-accent" />
                <span>Dirija-se à sala</span>
                <span className="rounded-xl bg-accent px-6 py-2 font-bold text-accent-foreground">
                  {currentCall.roomNumber}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center text-5xl font-medium text-muted-foreground">
              Aguardando chamada...
            </div>
          )}
        </div>
      </section>

      {/* Sidebar Section */}
      <aside className="flex flex-col bg-secondary/50 p-6">
        <header className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 text-primary" />
            <h2 className="text-2xl font-bold text-primary">ChamaUBS</h2>
          </div>
          <Clock />
        </header>

        <div className="mt-6 flex-grow">
          <h3 className="mb-4 text-xl font-semibold text-foreground">
            Últimas Chamadas
          </h3>
          <ul className="space-y-3">
            {callHistory.length > 0 ? (
              callHistory.map((call) => (
                <li
                  key={call.id}
                  className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm"
                >
                  <span className="font-medium">{call.patientName}</span>
                  <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold">
                    Sala {call.roomNumber}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhuma chamada no histórico.</p>
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
