import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Monitor, Users } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col animated-gradient">
      <header className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            UBS São Roque
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black tracking-tighter text-foreground md:text-6xl lg:text-7xl">
            Sistema de Chamada de Pacientes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Selecione a interface que deseja acessar para iniciar o atendimento ou visualizar as chamadas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/panel" className="flex items-center gap-2">
                <Users />
                <span>Painel do Funcionário</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/tv" className="flex items-center gap-2">
                <Monitor />
                <span>Tela da TV</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
            <p>&copy; {new Date().getFullYear()} AB Vitta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
