# Landing Page — João Carlos Cunzolo Jr. | Representante Ademicon

Landing page single-file, sem build step. Basta abrir `index.html` ou subir a pasta inteira em qualquer hospedagem estática.

## Estrutura

```
index.html          → a página inteira (HTML + CSS + JS)
assets/
  hero.mp4          → vídeo do Hero (comprimido, sem áudio, 440 KB)
  hero-poster.jpg   → imagem exibida enquanto o vídeo carrega
  cta-frame.jpg     → frame do vídeo usado no CTA cinematográfico
  joao-carlos.jpg   → retrato usado na seção "Sobre"
  ademicon-mark.png → símbolo Ademicon em branco (navbar/rodapé)
  ademicon-white.png→ lockup completo Ademicon em branco
  goal-*.jpg/.webp  → texturas de fundo dos 4 objetivos
  favicon.png
  vendor/           → GSAP, ScrollTrigger, Lenis, SplitType e as fontes
```

Tudo é hospedado localmente — a página **não depende de nenhum CDN externo** e funciona
até offline.

## O que editar

### 1. WhatsApp
Abra `index.html`, procure por `var CONFIG` (perto do fim do arquivo):

```js
var CONFIG = {
  WHATSAPP_NUMBER: "5511996050690",     // 55 + DDD + número, só dígitos
  WHATSAPP_DISPLAY: "+55 11 99605-0690",// como aparece escrito no rodapé
  WHATSAPP_MESSAGE: "Olá, João Carlos! ..."
};
```

Trocar o número aqui atualiza **todos** os 10 CTAs da página de uma vez.

### 2. Dados reais do João Carlos
Na seção "Sobre" existe um bloco marcado com o comentário
`<!-- Espaço reservado: substituir por dados reais ... -->`.
É onde entram anos de experiência, região de atuação, certificações — quando
essas informações forem confirmadas. Nada foi inventado.

### 3. Fotos das 4 possibilidades (Imóveis / Veículos / Negócios / Outros)
As imagens `assets/goal-*.jpg` são texturas abstratas geradas como placeholder
elegante. Para trocar por fotos reais, substitua os arquivos mantendo os nomes
(proporção vertical ~4:5) e apague os `.webp` correspondentes, ou atualize os
`<source srcset="...">` no HTML.

### 4. Domínio
Antes de publicar, troque `https://joaocarloscunzolo.com.br/` pelo domínio real
em três pontos: `<link rel="canonical">`, `og:url` e o bloco Schema.org.

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
  abre o WhatsApp — a simulação real acontece no atendimento.
- Cursor customizado, scroll horizontal pinado e partículas são desativados
  automaticamente em telas pequenas e em dispositivos de toque.
