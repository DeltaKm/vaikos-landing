# VAIKOS - Coming Soon Landing Page

Landing page "in costruzione" per VAIKOS, realizzata con Next.js, TypeScript e TailwindCSS.

## 🚀 Caratteristiche

- ✨ Design moderno e responsive
- 🎨 Gradient animato con effetti visivi
- 📧 Form per raccolta email newsletter
- 🎭 Animazioni fluide e professionali
- 📱 Completamente responsive (mobile-first)
- ⚡ Ottimizzato per performance con Next.js

## 🛠️ Tecnologie Utilizzate

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Hooks** - State management

## 📦 Installazione

```bash
npm install
```

## 🏃 Avvio del Progetto

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser per vedere il risultato.

## 📝 Personalizzazione

### Logo
Sostituisci il file `/public/logo.png` con il tuo logo (dimensioni consigliate: 200x200px).

### Testi
Modifica i testi in `app/page.tsx`:
- Titolo principale
- Sottotitoli
- Messaggi del form

### Colori
Il gradient di sfondo può essere personalizzato in `app/page.tsx` alla linea 20:
```tsx
bg-gradient-to-br from-pink-400 via-red-400 to-orange-400
```

### Social Links
Aggiorna gli href dei link social in `app/page.tsx` (linee 81-108).

## 🚀 Deploy

### Vercel (Consigliato)
```bash
npm run build
```

Deploy su [Vercel](https://vercel.com) con un click.

### Altri Provider
Il progetto è compatibile con qualsiasi provider che supporti Next.js (Netlify, AWS, etc.).

## 📄 Licenza

© 2026 VAIKOS. Tutti i diritti riservati.
