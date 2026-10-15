# GETME 🎀

GETME V1 é um app desktop compacto, em pixel art rosa, para baixar vídeos e músicas de links que você tem autorização para salvar.

## O que tem

- YouTube: MP4 ou MP3, com qualidade de vídeo até 4K.
- X, Instagram Reels e TikTok: MP4 com escolha de qualidade.
- Pasta Downloads ou outro destino escolhido no próprio app.
- Progresso com velocidade, tempo estimado, cancelamento e abertura do arquivo.
- Histórico local de downloads concluídos e busca rápida.
- Janela vertical compacta inspirada no formato de um iPhone, com navegação inferior.
- Preferências e histórico ficam no computador; o GETME não mantém servidor nem telemetria.

## Preparar no Windows

1. Instale uma versão recente do Node.js.
2. Instale o [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) e o [FFmpeg](https://ffmpeg.org/download.html).
3. No GETME, abra **Configurações** e selecione os executáveis se eles não estiverem no `PATH`.
4. No terminal, nesta pasta, rode `npm install` e depois `npm run dev`.

## V1

O código da V1 corresponde à versão `1.0.0` e o instalador para Windows pode ser gerado com `npm run dist:win`.

O FFmpeg é necessário para converter áudio MP3 e reunir faixas de vídeo e áudio em MP4. Nenhum login ou cookie do navegador é usado. O funcionamento de cada extrator pode mudar quando os sites mudam; se um link parar de funcionar, atualize o yt-dlp e tente novamente.

## Compilar instaladores

- Windows: `npm run dist:win`
- macOS: `npm run dist:mac`
- Linux: `npm run dist:linux`

O instalador é salvo na pasta `release/`.

## Privacidade e uso

Os links são enviados diretamente pelo yt-dlp às plataformas correspondentes. O GETME não retransmite mídia por um serviço próprio. Use somente conteúdo que você possui ou tem autorização para salvar e respeite as regras aplicáveis às plataformas.

## Licença

Este projeto ainda não declara uma licença de distribuição. Escolha uma licença antes de aceitar contribuições ou apresentar o código como software de código aberto.

