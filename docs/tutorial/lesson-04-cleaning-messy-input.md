# Lesson 04: Cleaning Messy Input

Hand-edited CSV files and spreadsheet exports often contain accidental spaces around commas, blank
lines, or invisible UTF-8 Byte Order Marks (BOM). In this lesson, you will configure `csv-lib` to
clean messy input automatically.

---

## Step 1: Trimming Unquoted Whitespace (`trim: true`)

When `trim: true` is enabled, leading and trailing spaces around unquoted fields (including header
names!) are removed, while intentional spaces _inside_ quotes are preserved:

```typescript
import { parseCsv } from 'csv-lib';

const messyCsv = '  id , name , note  \n  1 ,  Alice  , "  keep internal spaces  " ';

const records = parseCsv(messyCsv, {
  columns: true,
  trim: true,
});

console.log(records);
// [
//   { id: '1', name: 'Alice', note: '  keep internal spaces  ' }
// ]
```

---

## Step 2: Skipping Blank Lines (`skipEmptyLines: true`)

Enable `skipEmptyLines: true` to ignore blank lines anywhere in the input:

```typescript
import { parseCsv } from 'csv-lib';

const csvWithBlanks = '\n\na,b\n\n1,2\n\n3,4\n\n';
const rows = parseCsv(csvWithBlanks, { skipEmptyLines: true });

console.log(rows);
// [
//   ['a', 'b'],
//   ['1', '2'],
//   ['3', '4'],
// ]
```

---

## Step 3: Automatic UTF-8 BOM Handling

Spreadsheet applications often prepend `\uFEFF` (the UTF-8 Byte Order Mark) at the beginning of a
CSV file. Without BOM stripping, your first column header would become `"\uFEFFid"`, breaking
`record.id` lookups.

`csv-lib` strips a leading `\uFEFF` automatically on the first chunk—no configuration required:

```typescript
import { parseCsv } from 'csv-lib';

const bomCsv = '\uFEFFid,score\n1,100';
const records = parseCsv(bomCsv, { columns: true });

console.log(records[0]?.id);
// "1"
```

---

## Summary

- `{ trim: true }` strips whitespace outside quotes while keeping spaces inside quoted fields.
- `{ skipEmptyLines: true }` filters out empty rows caused by extra newlines.
- Leading UTF-8 BOMs (`\uFEFF`) are stripped automatically.

---

- [⬅ Previous: Lesson 03 — Headers & Typed Records](./lesson-03-headers-and-typed-records.md)
- [Next: Lesson 05 — Stringifying Rows & Records ➔](./lesson-05-stringifying-rows-and-records.md)
