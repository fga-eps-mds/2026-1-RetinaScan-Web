import { useState } from "react";
import { toast } from "sonner";
import { downloadLaudoApi } from "../api/downloadLaudo";

export const useDownloadLaudo = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (exameId: string, nomeArquivo: string) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. Faz a requisição na API
      const blob = await downloadLaudoApi(exameId);

      // 2. Cria uma URL temporária com o arquivo na memória
      const url = window.URL.createObjectURL(blob);
      
      // 3. Força o download no navegador via HTML
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      
      link.click();
      
      // 4. Limpa a memória
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download concluído com sucesso!");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao gerar o relatório. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { handleDownload, isDownloading };
};