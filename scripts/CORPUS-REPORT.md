# Corpus audit · 7 November 2026

The atlas retains 392 contiguous GRETIL IDs (70 / 78 / 130 / 114).
`lib/corpus-audit.json` records each comparison, source snapshot SHA-256 hashes,
English crosswalk, and candidate critical-edition references.
`lib/curation.json` records the actual editorial decisions and their sources.

## What was checked

- Rebuilt every source record from downloaded GRETIL and all four preserved Sinh
  chapters, and compared every imported field with the checked-in corpus.
- Compared all 392 Sanskrit records against Sanskrit Documents’ ITRANS text,
  converting ITRANS to IAST and ignoring spacing, punctuation, compound hyphens
  and apostrophes. Ten records differ: 1.22, 1.50, 1.52, 1.53, 1.55, 1.59,
  2.40, 2.68, 3.31, 3.80. Letter and accent differences remain significant.
- Inspected the Oxford–Marburg critical edition and generated content-based
  candidate references across its different numbering and appended material.
  These are discovery aids, not certified verse equivalences. Low similarity is
  marked unresolved. No modern English translation or apparatus is republished.
- Read the current draft renderings alongside the Sanskrit throughout all four
  chapters; corrected demonstrated errors and recorded high-risk readings. This
  editorial pass is not independent expert verification of every grammatical
  analysis, interpretation or manuscript reading.

## Corrections

The historical importer now deduplicates English III.107 (atlas 3.114), removes
an imported Mūlabandha subsection heading (3.61), preserves every English number
for shared translations, and maps English I.57 across atlas 1.56–57.

Chapter 3 annotations had inherited 119 historical Sinh translations but were
labelled original editorial drafts. The merge now assigns their actual author;
new editorial replacements have their own draft attribution. Seven original
supplements remain separately attributed. Comparison controls no longer describe
an original supplement as a historical translation.

New drafts correct direction (3.11), verse boundaries (3.12–14, 3.80–82), side versus
nostril (3.15), watch versus hour (3.31, 3.82), palate and go (3.48), location of the
lotus (3.51), union versus purification (3.65), struck versus killed (3.68),
inversion (3.79), envy versus sloth (3.95), and nasal exhalation (2.54).
Each decision has a verse-level explanation and source links in `curation.json`.

## Limits and unresolved readings

GRETIL does not identify a printed base edition or named inputter. Sanskrit
Documents names Jan Brzezinski and Ulrich Stiehl. Shared distinctive errors in
these transcriptions and the Sinh Sanskrit display mean their agreement is not
independent manuscript corroboration. Mirrors of Sinh are the same translation,
not additional independent translators.

The GRETIL IAST remains diplomatic, including known defects. Generated
Devanāgarī is a reading aid, not a second witness. Proposed readings belong in
notes; the atlas does not silently reconstruct a critical text. In particular,
1.16 and 1.18 differ materially from critical-edition readings; 2.68 is corrupt;
4.33 has uncertain syntax and no aligned Sinh English; 4.45 has a defective
sun/moon form; 4.114 has vidur where bindur is supported elsewhere. Their draft
interpretations remain qualified. The seven original supplements at 3.43, 3.91,
3.99–103 are not historical Sinh translations.

Historical spelling, interpretive additions and textual medical claims remain
attributed historical material, not endorsed modern scientific conclusions.
Word analyses, sandhi, prose rearrangements and semantic interpretations still
require scholarly review. Structural validation is not linguistic certification.

## Reproduce

Requires Python 3 and BeautifulSoup (`python3-bs4` or `beautifulsoup4`). Download
these UTF-8 snapshots into a directory outside the repository:

| Filename | Source |
| --- | --- |
| `gretil.html` | https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm |
| `hyp.itx` | https://sanskritdocuments.org/doc_yoga/hyp.itx |
| `sinh1.html`–`sinh4.html` | https://spiritmaji.com/sacredtext/hin/hyp/hyp03.htm through `hyp06.htm` |
| `oxford.html` | https://yoga.ames.ox.ac.uk/hp/reader/edition/ |

```sh
python3 scripts/import-corpus.py --source-dir /path/to/snapshots
node scripts/merge-annotations.mjs
python3 scripts/audit-corpus.py --source-dir /path/to/snapshots
node tests/check-data.mjs
```

Imports apply source notes from `curation.json`; merges apply its draft
translations. Re-importing cannot silently erase this curatorial layer. The audit
never writes the corpus, aborts if reconstruction differs, and emits metadata
rather than copies of comparison editions. Inspect changed snapshot hashes when
rerunning against newer source files.
