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
import { format } from 'date-fns';
import { capitalizeName } from '@/lib/utils';

export function TvDisplay() {
  const [lastAnnouncedId, setLastAnnouncedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
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
    if (typeof window === 'undefined' || !window.speechSynthesis || !audioReady) {
      return;
    }

    if (currentCall && currentCall.id !== lastAnnouncedId) {
      setLastAnnouncedId(currentCall.id);

      const formattedPatientName = capitalizeName(currentCall.patientName);
      let announcementText = `Olá, ${formattedPatientName}, por favor, dirija-se à sala ${currentCall.roomNumber}.`;
      if (currentCall.professionalName) {
        announcementText = `Olá, ${formattedPatientName}, atendimento com ${currentCall.professionalName}, na sala ${currentCall.roomNumber}.`;
      }


      try {
        const utterance = new SpeechSynthesisUtterance(announcementText);
        utterance.lang = 'pt-BR';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
          setIsSpeaking(false);
          toast({
            title: 'Erro de Áudio',
            description: 'Não foi possível reproduzir o anúncio por voz.',
            variant: 'destructive',
          });
        };
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis failed:', error);
        setIsSpeaking(false);
        toast({
          title: 'Erro de Áudio',
          description: 'Não foi possível gerar o anúncio por voz.',
          variant: 'destructive',
        });
      }
    }
  }, [currentCall, lastAnnouncedId, toast, audioReady]);
  
  const handleEnableAudio = () => {
    // This user interaction is necessary for browsers that block autoplay
    const synth = window.speechSynthesis;
    // Speak an empty utterance to "unlock" the audio context
    const utterance = new SpeechSynthesisUtterance('');
    synth.speak(utterance);
    setAudioReady(true);
     toast({
        title: 'Áudio Ativado',
        description: 'Os anúncios por voz estão prontos para tocar.',
    });
  };


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
       {!audioReady && (
        <AlertDialog open={!audioReady}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">Ativar Anúncios por Voz</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Para ouvir as chamadas, o navegador precisa da sua permissão. Clique no botão abaixo para ativar o som.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleEnableAudio} className="w-full">
                <Volume2 className="mr-2 h-4 w-4" />
                Ativar Áudio
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Main Call Section */}
      <section className="flex flex-col items-center justify-center p-4 md:p-8">
        <div className="flex w-full flex-col items-center justify-center text-center">
          {currentCall ? (
            <>
              <h2 className="text-4xl font-semibold uppercase tracking-wider text-muted-foreground md:text-5xl">
                Paciente
              </h2>
              <h1 className="mt-4 text-5xl font-black leading-none tracking-tight text-primary md:text-7xl lg:text-8xl">
                {capitalizeName(currentCall.patientName)}
              </h1>
               {currentCall.professionalName && (
                <p className="mt-6 text-3xl font-medium text-foreground md:text-4xl lg:text-5xl">
                  {currentCall.professionalName}
                </p>
              )}
              <div className="mt-12 flex flex-col items-center justify-center gap-4 text-foreground">
                <div className="flex items-center gap-4">
                  {isSpeaking ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary md:h-12 md:w-12" />
                  ) : (
                    <Volume2 className="h-10 w-10 text-primary md:h-12 md:w-12" />
                  )}
                  <p className="text-5xl font-bold uppercase md:text-6xl">Sala</p>
                </div>
                <div className="mt-2 rounded-2xl bg-primary px-12 py-3 shadow-lg md:px-16 md:py-4">
                  <p className="font-mono text-8xl font-bold text-primary-foreground md:text-9xl">
                    {currentCall.roomNumber}
                  </p>
                </div>
                <p className="mt-4 text-2xl text-muted-foreground">
                  {currentCall.timestamp ? format(currentCall.timestamp.toDate(), 'HH:mm:ss') : ''}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-4xl font-semibold text-muted-foreground md:text-5xl">
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
                  className="flex items-center justify-between gap-x-4 rounded-lg bg-background p-3 shadow-sm"
                >
                  <div className="flex-grow">
                    <p className="text-xl font-semibold">{capitalizeName(call.patientName)}</p>
                    {call.professionalName && (
                        <p className="text-sm text-muted-foreground">
                        {call.professionalName}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {call.timestamp ? format(call.timestamp.toDate(), 'HH:mm:ss') : ''}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-md bg-primary/20 px-3 py-1 text-base font-bold text-primary">
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
