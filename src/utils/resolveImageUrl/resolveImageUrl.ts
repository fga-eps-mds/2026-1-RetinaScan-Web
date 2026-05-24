import { api } from '@/shared/api';

export async function resolveImageUrl(
  url?: string
): Promise<string | undefined> {
  if (!url) return undefined;

  if (!import.meta.env.DEV) {
    return url;
  }

  if (!url.includes('ngrok')) {
    return url;
  }

  try {
    const response = await api.get(url, {
      responseType: 'blob',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Erro ao carregar imagem do ngrok:', url, error);
    return url;
  }
}
