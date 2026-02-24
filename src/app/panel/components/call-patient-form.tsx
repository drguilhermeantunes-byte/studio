'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { callPatient } from '../actions';
import { BellRing, Loader2 } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  patientName: z.string().min(3, {
    message: 'O nome do paciente deve ter pelo menos 3 caracteres.',
  }),
  roomNumber: z.string().min(1, {
    message: 'O número da sala é obrigatório.',
  }),
});

export function CallPatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      roomNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await callPatient(values);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: `Paciente ${values.patientName} chamado para a sala ${values.roomNumber}.`,
        variant: 'default',
      });
      form.reset();
      // Set focus back to the patient name field
      form.setFocus('patientName');
    } else {
      toast({
        title: 'Erro!',
        description: result.error || 'Não foi possível realizar a chamada.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Paciente</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sala</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chamando...
            </>
          ) : (
            <>
              <BellRing className="mr-2 h-4 w-4" />
              Chamar Paciente
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
