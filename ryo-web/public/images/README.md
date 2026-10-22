# Immagini RYO

Tutte le immagini del sito sono referenziate da `src/content/*.ts`.
Per sostituire un placeholder con l'originale ad alta risoluzione basta
**sovrascrivere il file mantenendo lo stesso nome e percorso**.

| Cartella    | Uso | Formato consigliato |
|-------------|-----|---------------------|
| `brand/`    | Logo (`logo.png`, trasparente) | PNG 1024×1024 |
| `locale/`   | Slider Hero + sezione Filosofia | JPG ≥ 2400px lato lungo |
| `drink/`    | Menu drink, abbinamenti | JPG ≥ 1600px |
| `cucina/`   | Menu food, abbinamenti | JPG ≥ 1600px |
| `eventi/`   | Le nostre serate | JPG ≥ 1600px |
| `galleria/` | Foto d'atmosfera | JPG ≥ 1600px |
| `staff/`    | Master bartender / team (ora placeholder) | JPG verticale 4:5 |
| `og/`       | Anteprima social 1200×630 | JPG |

`next/image` converte automaticamente in AVIF/WebP e genera le varianti responsive.
Le foto attuali sono ritagli degli screenshot Instagram (~1000px): sostituirle
con gli scatti originali prima della messa online.
