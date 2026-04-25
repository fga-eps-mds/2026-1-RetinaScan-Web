import SideBar from './side-bar/SideBar';
import EditProfile from '@/features/usuario/routes/EditProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSearchParams } from 'react-router';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditProfileDirty, setIsEditProfileDirty] = useState(false);
  const isEditProfileOpen = searchParams.get('editProfile') === 'true';

  const closeEditProfile = (options?: { skipDirtyCheck?: boolean }) => {
    const skipDirtyCheck = options?.skipDirtyCheck ?? false;

    if (!skipDirtyCheck && isEditProfileDirty) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja descartar e fechar?'
      );

      if (!confirmed) {
        return;
      }
    }

    setIsEditProfileDirty(false);

    const next = new URLSearchParams(searchParams);
    next.delete('editProfile');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <main className="flex-1 overflow-auto">{children}</main>

      <Dialog
        open={isEditProfileOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeEditProfile();
          }
        }}
      >
        <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] xl:max-w-3xl max-h-[92vh] overflow-y-auto border-0 bg-linear-to-b from-card via-card to-muted/30 p-0 shadow-2xl sm:rounded-3xl">
          <DialogHeader className="border-border/60 px-8 py-5">
            <DialogTitle className="translate-y-15 font-heading flex justify-center text-xl font-bold text-foreground">
              Edição de Dados do Usuário
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 sm:px-8 sm:py-6">
            <EditProfile
              onClose={() => closeEditProfile({ skipDirtyCheck: true })}
              onDirtyChange={setIsEditProfileDirty}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
