# Pradīpikā · The Study Atlas

A React/Vinext study website for one four-chapter GRETIL transcription of Svātmārāma’s Haṭhayogapradīpikā. It contains 392 Sanskrit verse records, IAST, mechanically generated Devanāgarī, historical and original draft English renderings, an editorial concept graph, contextual Sanskrit draft analyses, a phonetic spelling aid, and local reading tools.

## Run

Use Node 22.13 or later.

```sh
npm install
npm run dev
```

Use the local address printed by the development server. To build, run `npm run build`. The supplied Sites runtime integration is retained for deployment. The site is private by default on Sites.

## Run with Docker

Install Docker with the Compose plugin, then run:

```sh
docker compose up --build -d
```

Open http://localhost:8787. Set a different host port with, for example,
`PORT=8080 docker compose up --build -d`. View logs with `docker compose logs -f`
and stop the app with `docker compose down`.

The multi-stage image builds the app with Node 22 and serves the compiled Vinext
Worker through Wrangler's local runtime as a non-root user. No Cloudflare account
is required. Compose binds the port to the local machine. Sites hosting privacy,
ChatGPT sign-in, and hosted connector services are not provided by this container;
configure access control separately if exposing it beyond your machine.
See the [Wrangler runtime documentation](https://developers.cloudflare.com/workers/wrangler/commands/workers/).

Worker state persists in a Docker volume. Reading notes and bookmarks remain in
your browser's local storage, scoped to the address and port you use. Rebuild
after changing source files; this setup serves a built app without hot reload.

To use Docker without Compose:

```sh
docker build -t pradipika-atlas .
docker run --rm --init -p 127.0.0.1:8787:8787 pradipika-atlas
```

## Read and explore

- Select chapter, concept, or verse nodes; use the zoom buttons and drag the graph background to pan. Every verse is accessible in the library and by search.
- Search in Devanāgarī or Roman letters, with or without IAST diacritics. Verse references work too. Press `/` to focus search and Escape to close the passage panel.
- Use Meaning, Words, Sandhi, and Notes in the passage panel. The Sounds button opens the Sanskrit companion; it does not generate authoritative recitation audio.
- Switch between Devanāgarī, IAST, and both using the script control.
- Save passages and add notes. Notes remain in browser local storage on that device. Export the notebook for a portable copy.
- The concordance indexes exact source tokens plus components at editorial hyphens. It is not a morphological lemma index.
- Export study data to obtain the full source corpus, concept descriptions, draft analyses and a typed property graph containing chapter, verse, concept, source-form and parsed-word nodes.

## Editorial scope

Complete means coverage of this named transcription, not every manuscript, recension or later commentary. The source is a reference transcription with errors and does not identify its printed base edition. The mechanically derived Devanāgarī is not an independent witness. Source errors remain visible; proposed corrections and uncertainties appear in notes.

All grammatical analyses, prose rearrangements, phonetic aids and original translations are editorial drafts. Structural validation is not scholarly verification. Uncertain syntax is explicitly qualified; this edition cannot honestly be certified error-free. Consult the Oxford–Marburg critical-edition project for manuscript evidence and critically established readings.

The Pancham Sinh translation is the public-domain historical translation, recovered from the Sacred Texts digitization mirror. Sanskrit and English verse numbering diverge; crosswalk notes preserve these differences. Seven source verses omitted from that English text have separate original draft renderings. Source verse 4.33 has no imported historical translation; the draft analysis discusses its uncertain Sanskrit.

## Content files

- `lib/corpus.json`: base source text, script conversion, English crosswalk and provenance.
- `lib/concepts.json`: editorial topic ranges and related-concept links.
- `lib/annotations.json`: initial detailed annotations.
- `lib/annotations-12.json`, `lib/annotations-3.json`, `lib/annotations-4.json`: chapter extensions.
- `lib/study-annotations.json`: merged app dataset. Run `node scripts/merge-annotations.mjs` after editing source annotations.
- `lib/guide.json`: Sanskrit reading companion.
- `lib/sanskrit.ts`: deterministic Devanāgarī and broad segmental IPA spelling conversions; no inferred accent or recitation tradition.
- `lib/knowledge-graph.ts`: typed graph export generator.
- `scripts/import-corpus.py`: reproducible base-text importer. It requires BeautifulSoup and source HTML files in the project’s parent folder; download the linked GRETIL file as `gretil.html` and mirror chapter files as `sinh1.html`–`sinh4.html` in that parent folder before re-importing. The application itself runs entirely from the included JSON data.

## Checks

```sh
node scripts/merge-annotations.mjs
node tests/check-data.mjs
npx tsc --noEmit
npm run build
```

The integrity check confirms verse IDs/counts, topic coverage, valid links, schema completeness and known import regressions. Browser QA covers navigation, script display, Devanāgarī search, notebook persistence and mobile layout. None of these checks constitutes independent verification of Sanskrit interpretation.

## Sources

- Base Sanskrit: https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm
- Historical translation: https://sacred-texts.com/hin/hyp/index.htm
- Preserved digitization: https://spiritmaji.com/sacredtext/hin/hyp/index.htm
- Scholarly critical edition and project: https://yoga.ames.ox.ac.uk/hp/
- External dictionaries: https://www.sanskrit-lexicon.uni-koeln.de/

The modern critical edition is linked for comparison; its copyrighted English translation and apparatus are not reproduced in this project.
