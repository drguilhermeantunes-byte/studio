'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a polite patient announcement text in Portuguese.
 *
 * - dynamicPatientAnnouncement - A function that generates a patient announcement.
 * - DynamicPatientAnnouncementInput - The input type for the dynamicPatientAnnouncement function.
 * - DynamicPatientAnnouncementOutput - The return type for the dynamicPatientAnnouncement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicPatientAnnouncementInputSchema = z.object({
  patientName: z
    .string()
    .describe('The name of the patient to be announced.'),
  roomNumber: z.string().describe('The room number the patient should go to.'),
});
export type DynamicPatientAnnouncementInput = z.infer<
  typeof DynamicPatientAnnouncementInputSchema
>;

const DynamicPatientAnnouncementOutputSchema = z.object({
  announcementText: z
    .string()
    .describe('The polite Portuguese announcement text for the patient.'),
});
export type DynamicPatientAnnouncementOutput = z.infer<
  typeof DynamicPatientAnnouncementOutputSchema
>;

export async function dynamicPatientAnnouncement(
  input: DynamicPatientAnnouncementInput
): Promise<DynamicPatientAnnouncementOutput> {
  return dynamicPatientAnnouncementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientAnnouncementPrompt',
  input: {schema: DynamicPatientAnnouncementInputSchema},
  output: {schema: DynamicPatientAnnouncementOutputSchema},
  prompt: `Você é um assistente educado e profissional para anúncios de pacientes em uma Unidade Básica de Saúde (UBS).
Sua tarefa é criar um texto de anúncio claro e cortês em português (pt-BR) para chamar um paciente para uma sala específica.
O anúncio deve ser conciso e fácil de entender.

Use as seguintes informações:
Nome do paciente: {{{patientName}}}
Número da sala: {{{roomNumber}}}

Exemplo de anúncio:
Olá, {nome do paciente}, por favor, dirija-se à sala {número da sala}. Obrigada.

Por favor, gere o anúncio usando o nome e o número da sala fornecidos, seguindo o tom profissional e educado da UBS.
`,
});

const dynamicPatientAnnouncementFlow = ai.defineFlow(
  {
    name: 'dynamicPatientAnnouncementFlow',
    inputSchema: DynamicPatientAnnouncementInputSchema,
    outputSchema: DynamicPatientAnnouncementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate announcement text.');
    }
    return output;
  }
);
