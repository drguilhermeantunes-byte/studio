import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Users } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 animated-gradient">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            UBS Taboão
          </CardTitle>
          <CardDescription className="text-lg">
            Sistema de Chamada de Pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground">
            Selecione a interface que deseja acessar:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button asChild size="lg" className="h-auto py-4">
              <Link
                href="/panel"
                className="flex flex-col items-center justify-center gap-2"
              >
                <Users className="h-8 w-8" />
                <span className="text-base font-semibold">Painel do Funcionário</span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-auto py-4"
            >
              <Link
                href="/tv"
                className="flex flex-col items-center justify-center gap-2"
              >
                <Monitor className="h-8 w-8" />
                <span className="text-base font-semibold">Tela da TV</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AB Vitta. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
