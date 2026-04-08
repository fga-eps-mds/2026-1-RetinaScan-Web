# 2026.1 RetinaScan Web

Interface web da plataforma RetinaScan, um sistema de triagem de retinografias utilizando Inteligência Artificial para auxiliar na identificação de possíveis alterações na retina.

A aplicação permite que profissionais de saúde façam upload de imagens de retina, que são enviadas para um backend responsável por processar as imagens e gerar um pré-relatório automatizado com auxílio de IA.

## Links

Local: http://localhost:5173

## Requisitos

Antes de rodar o projeto, é necessário ter instalado:

- Docker
- Docker Compose

Verifique a instalação com:

```bash
docker --version
docker compose version
``` 

## Executando o Projeto

Para iniciar o ambiente de desenvolvimento com Docker:

sudo docker compose -f docker-compose.dev.yml up -d --build

Este comando irá:

- construir a imagem do frontend
- iniciar os containers necessários
- subir o ambiente de desenvolvimento

## Acessando a aplicação

Após iniciar os containers, a aplicação estará disponível em:

http://localhost:5173

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Docker
- Docker Compose

