import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

export default function PanelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 animated-gradient">
      <div className="absolute left-4 top-4">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            Painel do Funcionário
          </CardTitle>
          <CardDescription>
            Insira o nome do paciente e a sala para realizar a chamada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CallPatientForm />
        </CardContent>
      </Card>
    </main>
  );
}
