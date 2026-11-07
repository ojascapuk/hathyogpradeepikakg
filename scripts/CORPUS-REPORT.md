# Haṭhayogapradīpikā corpus import

## Coverage

392 unique, contiguous Sanskrit verse IDs from the GRETIL Unicode transcription:

- Chapter 1: 70
- Chapter 2: 78
- Chapter 3: 130
- Chapter 4: 114

Source: https://gretil.sub.uni-goettingen.de/gretil/1_sanskr/6_sastra/3_phil/yoga/hathyopu.htm

The supplied GRETIL header does not identify its inputter or printed base edition. This is a reference transcription, not a critical edition. The site should not identify it as a critically verified text.

`lib/corpus.json` is an array, ordered by chapter and number. Each object contains `id`, `chapter`, `number`, `iast`, `devanagari`, `section`, `english`, `englishNumber`, `translationAuthor`, `translationNote`, `sourceNotes`, `sourceUrl`, `translationSource`.

## Sanskrit policy

IAST is imported diplomatically. Headers and reference labels are excluded, verse linebreaks preserved. Devanāgarī is derived mechanically from the IAST and consequently preserves its source errors; it is not independently collated. Compound hyphens and spaces are retained for study. Final consonants at word boundaries receive explicit virāma.

Known source anomalies carry verse-level notes: 1.16, 1.34, 2.1, 2.2, 2.68, 4.114. This is not an exhaustive error inventory. The incomplete stray `HYP_2.` label in 2.2 is removed as an editorial reference artifact.

## English policy

Pancham Sinh historical public-domain translation, digitized at https://spiritmaji.com/sacredtext/hin/hyp/hyp03.htm (chapters hyp03–hyp06). The English edition contains numbering, placement, wording and digitization problems. An explicit crosswalk corrects numbering by verse content rather than pairing equal numbers blindly. Original English spelling and claims are preserved; these should be presented as historical text, not modern medical or anatomical claims.

Seven verses absent from the imported English have original literal study renderings labeled as unreviewed: 3.43, 3.91, 3.99–103. These are not Pancham Sinh translations.

4.33 has no translation in the imported English and its syntax requires textual review. Its `english` field is empty and `translationNote` explains why. Do not present a missing English field as a loading error or fabricate a translation.

Some historical translations span multiple Sanskrit verses and are repeated with a shared-translation note (e.g. 1.28–29, 1.55–56, 2.7–8, 3.11–12, 4.3–4). Some translations contain interpretive additions not literally present in Sanskrit. These cannot substitute for an independently reviewed word-by-word analysis.

## Verification

Checked uniqueness, counts, contiguous chapter numbering, source marker removal, no exceptionally long English blocks (which exposed and removed an inserted 21-verse commentary at 2.50), and selected alignment anomalies in chapters 1, 3, 4. Full Sanskrit textual collation and full English proofreading remain outstanding.
