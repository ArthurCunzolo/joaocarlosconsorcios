# Landing Page — João Carlos Cunzolo Jr. | Representante Ademicon

Site estático de 5 páginas, sem build step. Suba a pasta inteira em qualquer
hospedagem estática — não há nada para compilar ou instalar.

## Estrutura

O site tem 5 páginas. CSS e JavaScript são compartilhados entre todas — o
navegador baixa uma vez só e as páginas seguintes carregam instantaneamente.

```
index.html            → Home (foco em conversão)
solucoes/index.html   → /solucoes  — detalhe de cada objetivo + comparativo
sobre/index.html      → /sobre     — João Carlos, atendimento e a Ademicon
duvidas/index.html    → /duvidas   — FAQ, tipos de lance e glossário
simular/index.html    → /simular   — formulário dedicado (página de conversão)
assets/
  site.css            → todo o CSS do site
  site.js             → todo o JavaScript (animações, WhatsApp, formulário)
  hero.mp4            → vídeo do Hero (comprimido, sem áudio, 440 KB)
  hero-poster.jpg     → imagem exibida enquanto o vídeo carrega
  cta-frame.jpg       → frame do vídeo usado no CTA cinematográfico
  joao-carlos.jpg     → retrato usado em /sobre e na home
  ademicon-mark.png   → símbolo Ademicon em branco (navbar)
  ademicon-white.png  → lockup completo Ademicon (loader e rodapé)
  goal-*.jpg/.webp    → texturas de fundo dos 4 objetivos
  favicon.png
  vendor/             → GSAP, ScrollTrigger, Lenis, SplitType e as fontes
```

As páginas internas usam pastas (`sobre/index.html`) para que as URLs fiquem
limpas — `/sobre` em vez de `/sobre.html` — em qualquer hospedagem estática.

**Para ver localmente**, abra um servidor na pasta em vez de dar duplo clique no
arquivo (`file://` não resolve links de pasta):

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Tudo é hospedado localmente — o site **não depende de nenhum CDN externo**.

## O que editar

### 1. WhatsApp
Abra `assets/site.js` — as primeiras linhas do arquivo:

```js
var CONFIG = {
  WHATSAPP_NUMBER: "5511996050690",     // 55 + DDD + número, só dígitos
  WHATSAPP_DISPLAY: "+55 11 99605-0690",// como aparece escrito no rodapé
  WHATSAPP_MESSAGE: "Olá, João Carlos! ..."
};
```

Trocar o número aqui atualiza os CTAs de **todas as 5 páginas** de uma vez.

### 2. Dados reais do João Carlos
Em `sobre/index.html` existe um bloco marcado com o comentário
`<!-- ESPAÇO RESERVADO — preencher com informações reais -->`.
É onde entram anos de atuação, região atendida, formação e especialidades —
quando essas informações forem confirmadas. Nada ali foi presumido.

O único dado sobre a Ademicon que aparece no site ("o consórcio que mais cresce
no Brasil") vem do material institucional da própria Ademicon e está publicado
com a fonte completa logo abaixo, incluindo a data-base do Banco Central.
Se esse número for atualizado pela administradora, atualize também o rodapé
daquele parágrafo em `sobre/index.html`.

### 3. Fotos das 4 possibilidades (Imóveis / Veículos / Negócios / Outros)
As imagens `assets/goal-*.jpg` são texturas abstratas geradas como placeholder
elegante. Para trocar por fotos reais, substitua os arquivos mantendo os nomes
(proporção vertical ~4:5) e apague os `.webp` correspondentes, ou atualize os
`<source srcset="...">` no HTML.

### 4. Domínio
Antes de publicar, troque `joaocarloscunzolo.com.br` pelo domínio real. Ele
aparece em `canonical`, `og:url`, `og:image` e nos blocos Schema.org — nas cinco
páginas. Um find-and-replace no projeto inteiro resolve:

```bash
grep -rl "joaocarloscunzolo.com.br" --include="*.html" . \
  | xargs sed -i "s|joaocarloscunzolo.com.br|SEUDOMINIO.com.br|g"
```

## Publicar

**Vercel** — arraste a pasta em vercel.com/new, ou conecte o repositório Git para
deploy automático a cada push.
**GitHub Pages** — suba a pasta no repositório e ative Pages nas configurações.

Nenhuma configuração de build é necessária em nenhum dos dois.

## Notas técnicas

- Se GSAP falhar em carregar, a página se degrada com elegância: aparece completa
  e utilizável, apenas sem animação.
- `prefers-reduced-motion` é respeitado — animações são desligadas para quem
  configurou isso no sistema.
- O formulário **não calcula valores**. Ele monta uma mensagem com as respostas e
  abre o WhatsApp — a simulação real acontece no atendimento. Ele existe em dois
  lugares (home e /simular) e funciona igual nos dois.
- A navbar destaca sozinha a página atual, via `data-page` no `<body>`.
- Cursor customizado, scroll horizontal pinado e partículas são desativados
  automaticamente em telas pequenas e em dispositivos de toque.
