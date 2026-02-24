'use client';

import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the config is valid before initializing
  if (!firebaseConfig.apiKey) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center text-foreground">
        <div className="max-w-md p-4">
          <h1 className="text-2xl font-bold">
            Configuração do Firebase Incompleta
          </h1>
          <p className="mt-2 text-muted-foreground">
            As chaves de API do Firebase não foram encontradas. A aplicação não
            pode se conectar ao banco de dados.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Isso geralmente acontece quando o projeto está sendo configurado. Eu
            estou trabalhando para corrigir isso para você.
          </p>
        </div>
      </div>
    );
  }

  const { firebaseApp, auth, firestore } = initializeFirebase();

  return (
    <FirebaseProvider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseProvider>
  );
}
