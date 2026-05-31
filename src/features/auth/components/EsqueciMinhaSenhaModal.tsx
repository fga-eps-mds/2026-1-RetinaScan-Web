import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useRequestPasswordReset } from '../hooks/useRequestPasswordReset';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCRM(value: string) {
  return value.toUpperCase().replace(/\s+/g, ' ').trim();
}

function isValidCRM(value: string) {
  const crm = normalizeCRM(value);

  return (
    /^CRM[-/\s]?\d{1,10}[-/\s]?[A-Z]{2}$/i.test(crm) ||
    /^\d{1,10}[-/\s]?[A-Z]{2}$/i.test(crm)
  );
}

function looksLikeCRM(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return false;

  return /^CRM/i.test(trimmed) || /^\d{1,10}[-/\s]?[A-Z]{2}$/i.test(trimmed);
}

function detectType(value: string): 'email' | 'crm' | 'unknown' {
  const trimmed = value.trim();

  if (!trimmed) return 'unknown';
  if (trimmed.includes('@')) return 'email';
  if (looksLikeCRM(trimmed)) return 'crm';

  return 'unknown';
}

type ApiErrorResponse = {
  message?: string;
};

const EsqueciMinhaSenhaModal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [identifier, setIdentifier] = useState('');
  const [touched, setTouched] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const recoveryFunction = useRequestPasswordReset();

  const type = useMemo(() => detectType(identifier), [identifier]);

  const error = useMemo(() => {
    if (!touched || !identifier.trim()) return '';

    const sanitizedValue =
      type === 'crm' ? normalizeCRM(identifier) : identifier.trim();

    if (type === 'email') {
      return isValidEmail(sanitizedValue) ? '' : 'E-mail inválido';
    }

    if (type === 'crm') {
      return isValidCRM(sanitizedValue)
        ? ''
        : 'CRM inválido. Ex.: CRM 12345-DF';
    }

    return 'Informe um e-mail ou CRM válido';
  }, [identifier, touched, type]);

  function handleChange(value: string) {
    setServerMessage(null);

    const detectedType = detectType(value);

    if (detectedType === 'crm') {
      setIdentifier(normalizeCRM(value));
      return;
    }

    setIdentifier(value);
  }

  function handleSubmit() {
    setTouched(true);
    setServerMessage(null);

    const sanitizedValue =
      type === 'crm' ? normalizeCRM(identifier) : identifier.trim();

    if (!sanitizedValue || error || type === 'unknown') return;

    recoveryFunction.mutate(
      {
        type,
        value: sanitizedValue,
      },
      {
        onSuccess: (data, variables) => {
          setServerMessage(
            data?.message ||
              (variables.type === 'email'
                ? 'Enviaremos um e-mail com instruções para redefinição da sua senha.'
                : 'Enviaremos as instruções de recuperação vinculadas ao CRM informado.')
          );
          setStep('success');
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<ApiErrorResponse> | undefined;

          setServerMessage(
            error?.response?.data?.message ||
              'Não foi possível processar a solicitação.'
          );
        },
      }
    );
  }

  function handleBack() {
    setStep('form');
    setServerMessage(null);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Esqueci minha senha</DialogTitle>
              <DialogDescription>
                Informe seu e-mail ou CRM para receber as instruções de
                redefinição.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#12223A]">
                  E-mail ou CRM
                </label>

                <Input
                  type="text"
                  placeholder="Digite seu e-mail ou CRM"
                  value={identifier}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={() => setTouched(true)}
                  autoComplete="username"
                  disabled={recoveryFunction.isPending}
                />

                {identifier.trim() && type !== 'unknown' && (
                  <p className="text-xs text-gray-500">
                    Tipo identificado: {type.toUpperCase()}
                  </p>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                {serverMessage && (
                  <p className="text-sm text-red-600">{serverMessage}</p>
                )}
              </div>

              <Button
                type="button"
                className="w-full rounded-md px-4 py-2"
                disabled={recoveryFunction.isPending}
                onClick={handleSubmit}
              >
                {recoveryFunction.isPending
                  ? 'Enviando...'
                  : 'Enviar instruções'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitação enviada</DialogTitle>
              <DialogDescription>
                {serverMessage ||
                  'Enviaremos as instruções de recuperação para o identificador informado.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
                Verifique sua caixa de entrada e também a pasta de spam. Se o
                cadastro existir na plataforma, você receberá as instruções em
                breve.
              </div>

              <Button
                type="button"
                className="w-full rounded-md px-4 py-2"
                onClick={handleBack}
              >
                Voltar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EsqueciMinhaSenhaModal;
