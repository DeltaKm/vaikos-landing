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

## 🧾 Area Fatture (`/invoice`)

Area privata per generare fatture PDF, riservata a pochi amministratori. Nessun database viene utilizzato: le fatture non vengono salvate sul server.

### 1. Variabili d'ambiente

Crea un file `.env` (mai commesso al repository, vedi `.gitignore`) partendo da `.env.example`:

```bash
INVOICE_ADMIN_PASSWORD_HASH=   # hash bcrypt della password (vedi punto 2)
INVOICE_SESSION_SECRET=        # stringa segreta random, almeno 16 caratteri
```

Per generare `INVOICE_SESSION_SECRET`:

```bash
openssl rand -base64 32
```

### 2. Generare l'hash bcrypt della password

```bash
npm run hash-password -- "la-tua-password"
```

Copia l'hash stampato in `INVOICE_ADMIN_PASSWORD_HASH`. **Non inserire mai la password in chiaro o il suo hash nel codice sorgente.**

### 3. Dati societari fissi

I dati che non cambiano da una fattura all'altra (ragione sociale, indirizzo, VAT ID, IBAN, BIC, ecc.) sono definiti in `config/invoice-config.ts`. Per modificarli, edita direttamente quel file: non sono editabili dal modulo di compilazione fattura.

### 4. Logo

Il logo utilizzato nell'anteprima e nel PDF è `public/vaikos1-no-sfondo.png`, già presente nel progetto. Per sostituirlo, rimpiazza quel file mantenendo lo stesso nome, oppure aggiorna il percorso in `components/invoice/InvoicePreview.tsx` e `app/api/invoices/generate/route.ts` (funzione `getLogoDataUrl`).

### 5. Avvio del progetto

```bash
npm install
npm run dev
```

### 6. Accesso all'area fatture

Vai su `http://localhost:3000/invoice`. Se non hai una sessione valida, verrai reindirizzato a `/invoice/login`. Inserisci la password in chiaro (non l'hash): verrà verificata sul server tramite bcrypt e verrà creata una sessione firmata (cookie httpOnly, valida 8 ore).

### 7. Fatture non salvate

Nessuna fattura, cliente, importo o PDF viene salvato sul server. La generazione avviene interamente nella singola richiesta HTTP. Puoi facoltativamente salvare una bozza dei dati del modulo **solo nel browser corrente** tramite i pulsanti "Salva bozza / Carica bozza / Cancella bozza" (localStorage, mai sincronizzato automaticamente).

### 8. Numero fattura

Il numero fattura è **sempre obbligatorio e manuale**. Il progetto non incrementa automaticamente il numero (non essendoci un database, si rischierebbero duplicati). Viene mostrato solo un suggerimento dell'ultimo numero usato su quel browser (localStorage): l'utente deve sempre verificarlo e confermarlo manualmente prima di generare il PDF.

### 9. Verifica visiva del PDF

Dopo aver cliccato "Generate PDF", apri il file scaricato (`Invoice-<numero>-<cliente>.pdf`) e controlla:
- che l'intera fattura resti su una pagina se il contenuto è breve;
- che, con molte righe, l'intestazione della tabella si ripeta correttamente sulle pagine successive;
- che nessuna riga sia tagliata e che non ci siano sovrapposizioni di testo;
- che non compaia una seconda pagina vuota o con la sola dicitura della valuta.

### Limiti noti

- Il rate limiting dei tentativi di login è mantenuto in memoria: si azzera al riavvio del server e non è condiviso tra istanze multiple.
- Aspetti fiscali (aliquote IVA, reverse charge, dati societari) devono essere verificati da un commercialista prima dell'uso in produzione.

## 📄 Licenza

© 2026 VAIKOS. Tutti i diritti riservati.
