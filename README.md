# Pradīpikā · The Study Atlas

A React/Vinext study website for one four-chapter GRETIL transcription of Svātmārāma’s Haṭhayogapradīpikā. It contains 392 Sanskrit verse records, IAST, mechanically generated Devanāgarī, historical and original draft English renderings, an editorial concept graph, contextual Sanskrit draft analyses, a phonetic spelling aid, and linked reading tools.

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

Worker state persists in a Docker volume. Rebuild
after changing source files; this setup serves a built app without hot reload.

To use Docker without Compose:

```sh
docker build -t pradipika-atlas .
docker run --rm --init -p 127.0.0.1:8787:8787 pradipika-atlas
```

## Reading layout, theme and sources

Use the three-position theme slider (Light / System / Dark) in the header. System follows your device’s colour
scheme, including changes while the app is open. Your choice is saved locally.

The interface uses a 12px minimum text size, larger reading text, and a golden-ratio
main/detail split on wide screens. Phones use a single column with an overlay
passage reader. Personal notebook tools and recurring draft notifications are
removed; edition details remain in Sources. Searches such as `2.54` and `२.५४`
return that exact verse and scroll its highlighted card into view. Press Enter
to open the first result.

Sources & references includes the downloadable verse-by-verse audit.
The [corpus audit report](scripts/CORPUS-REPORT.md) documents the comparisons,
corrections, source dependencies and unresolved readings. Curatorial decisions
and citations live in `lib/curation.json` and survive corpus re-imports.

## Read and explore

- Select chapter, concept, or verse nodes; use the zoom buttons and drag the graph background to pan. Every verse is accessible in the library and by search.
- Search in Devanāgarī or Roman letters, with or without IAST diacritics. Verse references work too. Press `/` to focus search and Escape to close the passage panel.
- Use Meaning, Words, Sandhi, and Sources in the passage panel. Word entries show Sanskrit grammatical terms in Devanāgarī and IAST before their English explanations. Sandhi forms, split parts, compound forms, and compound components prioritize Devanāgarī, with IAST and glosses alongside them. Matching compound analyses can be expanded directly under a word. Explicit Sanskrit vigrahas are distinguished from component lists; uncertain readings remain qualified. The Sounds button opens the Sanskrit companion; it does not generate authoritative recitation audio.
- Open any concept in the knowledge graph or concept index to find a named, related Wikipedia article.
- Verse reading uses continuous saṃhitā spelling, without editorial compound hyphens, with single daṇḍas at half-verse boundaries and a closing double daṇḍa plus verse number. Devanāgarī verse numbers use Devanāgarī digits. Copied verses use the same reading form. Word analyses retain their separated forms; Sources includes the original GRETIL transcription.
- These print conventions follow the supplied Adyar Library edition with Brahmānanda’s Jyotsnā commentary. This is a presentation change: the atlas keeps its existing GRETIL readings and verse IDs, which differ from the book in places.
- Switch between Devanāgarī, IAST, and both using the script control.
- Open the Glossary for 72 text topics and 14 grammar terms, with definitions, verse links, text sources, and related Wikipedia articles.
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
- `lib/source-locations.json`: preserved source anchors and Sanskrit text-fragment targets; regenerate with `python3 scripts/build-source-locations.py --source-dir /path/to/snapshots`.
- `lib/glossary.ts`: grammar definitions and named Wikipedia references.
- `lib/sanskrit.ts`: deterministic Devanāgarī and broad segmental IPA spelling conversions; no inferred accent or recitation tradition.
- `lib/knowledge-graph.ts`: typed graph export generator.
- `scripts/import-corpus.py`: reproducible base-text importer. It requires BeautifulSoup and source HTML files in the project’s parent folder; download the linked GRETIL file as `gretil.html` and mirror chapter files as `sinh1.html`–`sinh4.html` in that parent folder before re-importing. The application itself runs entirely from the included JSON data.

## Checks

```sh
node scripts/merge-annotations.mjs
node tests/check-data.mjs
node --experimental-strip-types tests/check-grammar.mjs
node --experimental-strip-types tests/check-reading.mjs
node --experimental-strip-types tests/check-verse-format.mjs
npx tsc --noEmit
npm run build
```

For repeatable browser QA, start a temporary Chrome instance in another terminal:

```sh
google-chrome --headless --no-sandbox --disable-gpu --remote-debugging-port=9223 --user-data-dir=/tmp/pradipika-browser-profile about:blank
```

With the Docker app running, run `node tests/check-browser.mjs`. The check covers
theme slider keyboard control, all three modes, persistence, live system changes,
320px and 390px layouts, translation attribution, Sanskrit grammar, compound
expansions and sampled text contrast. It saves screenshots and contrast results to
`/tmp/pradipika-browser-qa`. The checks also verify the 12px minimum, golden-ratio
panels, linked glossary, and exact verse scrolling. `APP_URL`, `BROWSER_DEBUG_URL` and `QA_OUTPUT_DIR` can
override the defaults. Use the sandbox-disabling flag only for this temporary
headless test profile when required by your environment.

The integrity check confirms verse IDs/counts, topic coverage, valid links, schema completeness and known import regressions. Browser QA covers navigation, script display, Devanāgarī search, exact verse navigation and mobile layout. None of these checks constitutes independent verification of Sanskrit interpretation.

## Sources

- Base Sanskrit: https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm
- Historical translation: https://sacred-texts.com/hin/hyp/index.htm
- Preserved digitization: https://spiritmaji.com/sacredtext/hin/hyp/index.htm
- Scholarly critical edition and project: https://yoga.ames.ox.ac.uk/hp/
- External dictionaries: https://www.sanskrit-lexicon.uni-koeln.de/

The modern critical edition is linked for comparison; its copyrighted English translation and apparatus are not reproduced in this project.
