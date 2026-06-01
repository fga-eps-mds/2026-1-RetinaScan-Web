import { UploadStep } from '../components/UploadStep';
import { FormularioStep } from '../components/FormularioStep';
import { useNovoExame } from '@/features/criacao-exames/hooks/useNovoExame'; 

const NovoExame = () => {
 
  const {
    step,
    setStep,
    isDicom,
    formData,
    setters,
    errors,
    clearFieldError,
    isPending,
    canProceedToForm,
    canSubmitFinal,
    handleImageChange,
    handleCreateExam
  } = useNovoExame();

  return (
    <div className="h-dvh overflow-y-auto px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        
        <header className="text-center">
          <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">Novo Exame</h2>
          <p className="text-md text-muted-foreground">
            {step === 'UPLOAD' ? 'Inicie fazendo o upload das imagens da retina.' : 'Revise e complete os dados do paciente (opcional).'}
          </p>
        </header>

        {/* Orquestração dos Passos: Condiciona a renderização com base no estado `step` */}
        {step === 'UPLOAD' && (
          <UploadStep 
            canProceed={canProceedToForm}
            onImageChange={handleImageChange}
            onNext={() => setStep('FORM')}
          />
        )}

        {step === 'FORM' && (
          <FormularioStep 
            isDicom={isDicom}
            formData={formData}
            setters={setters}
            errors={errors}
            clearFieldError={clearFieldError}
            isPending={isPending}
            canSubmit={canSubmitFinal}
            onBack={() => setStep('UPLOAD')}
            onSubmit={handleCreateExam}
          />
        )}

      </div>
    </div>
  );
};

export default NovoExame;