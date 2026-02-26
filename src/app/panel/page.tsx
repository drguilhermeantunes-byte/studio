'use client';

import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { CallPatientForm } from './components/call-patient-form';
import { RecentCalls } from './components/recent-calls';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';
import type { Call } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';

const formSchema = z.object({
  patientName: z.string().min(3, {
    message: 'O nome do paciente deve ter pelo menos 3 caracteres.',
  }),
  professionalName: z.string().optional(),
  roomNumber: z.string({
    required_error: 'Por favor, selecione uma sala.',
  }),
});


export default function PanelPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const callsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
        collection(firestore, 'calls'),
        orderBy('timestamp', 'desc'),
        limit(5)
        );
    }, [firestore]);

    const { data: calls, loading: callsLoading } = useCollection<Call>(callsQuery);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientName: '',
            roomNumber: undefined,
            professionalName: '',
        },
    });

    const handleCallSelect = (call: Call) => {
        form.reset({
            patientName: call.patientName,
            professionalName: call.professionalName || '',
            roomNumber: call.roomNumber,
        });
        toast({
            title: 'Formulário preenchido',
            description: `Dados de ${call.patientName} carregados para nova chamada.`,
        });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
          if (!firestore) throw new Error("Firestore not available");
          const callsCollection = collection(firestore, 'calls');
          await addDoc(callsCollection, {
            patientName: values.patientName,
            roomNumber: values.roomNumber,
            professionalName: values.professionalName || '',
            timestamp: serverTimestamp(),
          });
    
          toast({
            title: 'Sucesso!',
            description: `Paciente ${values.patientName} chamado para a sala ${values.roomNumber}.`,
            variant: 'default',
          });
          form.reset();
          form.setFocus('patientName');
        } catch (error) {
          console.error('Error adding document: ', error);
          toast({
            title: 'Erro!',
            description:
              'Não foi possível realizar a chamada. Verifique sua conexão com a internet.',
            variant: 'destructive',
          });
        } finally {
          setIsSubmitting(false);
        }
      }

    return (
        <main className="min-h-screen w-full bg-background animated-gradient p-4 lg:p-8">
            <div className="absolute left-4 top-4 z-10">
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
            </div>
            <div className="container mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-2">
                <div className="lg:sticky lg:top-8">
                    <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                <Logo className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-primary">
                                Painel do Funcionário
                            </CardTitle>
                            <CardDescription>
                                Insira os dados para realizar a chamada.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CallPatientForm form={form} onSubmit={onSubmit} isSubmitting={isSubmitting} />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-2 border-border/50 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <History className="h-6 w-6 text-muted-foreground" />
                            <CardTitle>Últimas Chamadas</CardTitle>
                        </div>
                        <CardDescription>
                            Clique no botão de repetir para preencher o formulário novamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentCalls calls={calls} loading={callsLoading} onCallSelect={handleCallSelect} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
