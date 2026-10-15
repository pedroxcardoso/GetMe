# GetMe

Downloader de vídeos para desktop. Cole um link, escolha MP4 ou MP3, baixa.

Suporta YouTube, X, Instagram Reels e TikTok. Roda em Windows, macOS e Linux.
Usa [yt-dlp](https://github.com/yt-dlp/yt-dlp) e [FFmpeg](https://ffmpeg.org) por baixo.

## Instalar

Baixe o instalador na [última release](https://github.com/pedroxcardoso/GetMe/releases/latest).

Na primeira abertura, vá em **Ajustes** e aponte para o yt-dlp e o FFmpeg.
Se eles já estiverem no `PATH`, o GetMe encontra sozinho.

## Plataformas

| Plataforma      | Formato   | Qualidade    |
|-----------------|-----------|--------------|
| YouTube         | MP4 / MP3 | até 4K       |
| X               | MP4       | selecionável |
| Instagram Reels | MP4       | selecionável |
| TikTok          | MP4       | selecionável |

## Recursos

- Progresso com velocidade e tempo restante; cancela a qualquer momento
- Histórico local com busca
- Pasta de destino configurável
- Sem login, sem cookies, sem servidor, sem telemetria — tudo fica na sua máquina

## Rodar do código

Requer Node.js 20+, yt-dlp e FFmpeg.

```bash
git clone https://github.com/pedroxcardoso/GetMe
cd GetMe
npm install
npm run dev
```

Gerar instaladores (saída em `release/`):

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## Problemas comuns

**Um link parou de funcionar.** As plataformas mudam com frequência. Atualize o yt-dlp
(`yt-dlp -U`) e tente de novo. Se persistir, abra uma issue com o link e o erro.

**MP3 ou vídeo em alta qualidade falha.** Verifique se o FFmpeg está configurado em
Ajustes — ele é obrigatório para converter áudio e juntar faixas de vídeo e áudio.

## Uso responsável

Os links vão direto do seu computador para a plataforma via yt-dlp; o GetMe não
intermedia nada. Baixe apenas conteúdo que você tem autorização para salvar e respeite
os termos de cada plataforma.

## Licença

[MIT](LICENSE)
