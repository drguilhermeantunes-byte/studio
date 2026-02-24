'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const CallPatientSchema = z.object({
  patientName: z.string().min(3),
  roomNumber: z.string().min(1),
});

export async function callPatient(values: z.infer<typeof CallPatientSchema>) {
  const validatedFields = CallPatientSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos.' };
  }

  const { patientName, roomNumber } = validatedFields.data;

  try {
    const callsCollection = collection(db, 'calls');
    await addDoc(callsCollection, {
      patientName,
      roomNumber,
      timestamp: serverTimestamp(),
    });
    revalidatePath('/tv');
    return { success: 'Chamada realizada com sucesso!' };
  } catch (error) {
    console.error('Error adding document: ', error);
    return { error: 'Erro ao se comunicar com o banco de dados.' };
  }
}

export async function resetHistory() {
  try {
    const callsCollection = collection(db, 'calls');
    const callsSnapshot = await getDocs(callsCollection);
    
    if (callsSnapshot.empty) {
      return { success: "Histórico já estava vazio." };
    }

    const batch = writeBatch(db);
    callsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    revalidatePath('/tv');
    return { success: 'Histórico de chamadas resetado com sucesso!' };
  } catch (error) {
    console.error('Error resetting history: ', error);
    return { error: 'Não foi possível resetar o histórico.' };
  }
}
