'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2 } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  patientName: z.string().min(3, {
    message: 'O nome do paciente deve ter pelo menos 3 caracteres.',
  }),
  professionalName: z.string().optional(),
  roomNumber: z.string({
    required_error: 'Por favor, selecione uma sala.',
  }),
});


const professionals = [
  {
    role: 'Consulta Médica',
    names: ['Doutora Bruna', 'Doutor Guilherme', 'Doutora Maria Jose', 'Médico (Outro)'],
  },
  {
    role: 'Consulta Ginecologia',
    names: ['Doutora Anselma'],
  },
  {
    role: 'Consulta Enfermagem',
    names: ['Cintia', 'Jason', 'Karoline'],
  },
  {
    role: 'Consulta Odontologia',
    names: ['Doutora Karina'],
  },
  {
    role: 'Consulta Nutricionista',
    names: ['Nataly'],
  },
  {
    role: 'Técnicos de Enfermagem',
    names: ['Eva', 'Vera Lucia', 'Thiago', 'Catia', 'Beatriz'],
  },
  {
    role: 'ACS',
    names: ['Alessandra', 'Bruno', 'Diogo',  'Gabriela', 'Laudeli', 'Jackeline', 'Victor Hugo', 'Taiz'],
  },
  {
    role: 'Administrativo',
    names: ['Sarah'],
  },
];

const rooms = [
  '1 Consultório',
  '2 Consultório',
  '3 Consultório',
  '4 Consultório',
  '5 Consultório',
  '6 Vacinação',
  '7 Triagem',
  '10 Consultório',
  '8 Odontologia',
  '9 Curativo',
  '9 Medicação',
  'Pós-consulta',
  'Recepção',
  'Farmácia',
  'Medicação',
  'Ginecologia',
  'Telemedicina',
];

interface CallPatientFormProps {
    form: UseFormReturn<z.infer<typeof formSchema>>;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    isSubmitting: boolean;
}

export function CallPatientForm({ form, onSubmit, isSubmitting }: CallPatientFormProps) {
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
                <Input placeholder="Ex: Maria Aparecida A." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="professionalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {professionals.map((group) => (
                    <SelectGroup key={group.role}>
                      <SelectLabel>{group.role}</SelectLabel>
                      {group.names.map((name, index) => (
                        <SelectItem key={`${group.role}-${name}-${index}`} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room, index) => (
                    <SelectItem key={`${room}-${index}`} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
