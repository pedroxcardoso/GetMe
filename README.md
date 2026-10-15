# GETME 🎀

GETME V1 é um app desktop compacto, em pixel art, para baixar vídeos e músicas de links que você tem autorização para salvar. A aparência escura do robô é o tema inicial; Sol/Lua alterna entre os temas e guarda sua preferência.

## O que tem

- YouTube: MP4 ou MP3, com qualidade de vídeo até 4K.
- X, Instagram Reels e TikTok: MP4 com escolha de qualidade.
- Pasta Downloads ou outro destino escolhido no próprio app.
- Progresso com velocidade, tempo estimado, cancelamento e abertura do arquivo.
- Histórico local de downloads concluídos e busca rápida.
- Janela vertical compacta inspirada no formato de um iPhone, com navegação inferior.
- Robô pixelado no app e no ícone do instalador para Windows.
- Fontes Pixelify Sans e Silkscreen empacotadas localmente para manter o visual pixel sem depender da internet.
- Preferências e histórico ficam no computador; o GETME não mantém servidor nem telemetria.

## Preparar no Windows

O instalador oferece a opção **Baixar yt-dlp e FFmpeg durante a instalação**. Ela baixa os executáveis, confere os checksums e o GETME os reconhece automaticamente; requer internet e cerca de 125 MB. No Windows, os arquivos ficam em `%APPDATA%\pipoca-pixel-downloader\tools`. Se a preparação falhar ou você desmarcar a opção, o app ainda instala e você pode indicar os executáveis em **Configurações**. Também é possível instalá-los depois: [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) e [FFmpeg para Windows](https://www.gyan.dev/ffmpeg/builds/).

Para desenvolver o GETME, instale uma versão recente do Node.js; no terminal, rode `npm install` e depois `npm run dev`.

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
