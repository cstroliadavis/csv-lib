# Lesson 02: Delimiters, Quotes & Multiline Cells

Real-world data rarely consists of plain words. Fields often contain commas, quotation marks, or
multiple lines of text. In this lesson, you will learn how `csv-lib` handles RFC 4180 quoting and
custom delimiters.

---

## Step 1: Quoted Fields & Escaped Quotes

Under RFC 4180, any field containing a comma, a newline, or a double quote is wrapped in double
quotes (`"`). A literal double quote inside a quoted field is represented by doubling it (`""`):

```typescript
import { parseCsv } from 'csv-lib';

const csv = [
  'id,quote,author',
  '1,"Simplicity, clarity, generality.","Kernighan & Pike"',
  '2,"He said ""Hello!"" to everyone","Mark"',
].join('\n');

const rows = parseCsv(csv);

console.log(rows[1]);
// ['1', 'Simplicity, clarity, generality.', 'Kernighan & Pike']

console.log(rows[2]);
// ['2', 'He said "Hello!" to everyone', 'Mark']
```

---

## Step 2: Multiline Cells

Line breaks (`\n` or `\r\n`) that appear _inside_ a quoted field are part of the cell's text rather
than a row boundary:

```typescript
import { parseCsv } from 'csv-lib';

const csv = 'ticketId,notes\n101,"Line 1\nLine 2\nLine 3"\n102,"Single line"';
const rows = parseCsv(csv);

console.log(rows[1]?.[1]);
// Line 1
// Line 2
// Line 3
```

---

## Step 3: Custom Delimiters (TSV & Semicolons)

Not all delimited files use commas. Pass `delimiter` in the second argument (`CsvParserOptions`) to
parse Tab-Separated Values (`\t`) or semicolon-separated (`;`) files:

```typescript
import { parseCsv } from 'csv-lib';

const semicolonCsv = 'product;price;notes\r\nKeyboard;129,99;"Mechanical; tactile"';
const rows = parseCsv(semicolonCsv, { delimiter: ';' });

console.log(rows);
// [
//   ['product', 'price', 'notes'],
//   ['Keyboard', '129,99', 'Mechanical; tactile'],
// ]
```

---

## Summary

- Enclosing a field in quotes (`"..."`) allows it to contain delimiters and line breaks safely.
- Doubled quotes (`""`) inside a quoted field are unescaped to a single `"` character.
- Use `{ delimiter: '\t' }` or `{ delimiter: ';' }` to parse non-comma-separated formats.

---

- [⬅ Previous: Lesson 01 — Your First CSV Parse](./lesson-01-first-parse.md)
- [Next: Lesson 03 — Headers & Typed Records ➔](./lesson-03-headers-and-typed-records.md)
