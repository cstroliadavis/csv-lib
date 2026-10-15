# Lesson 01: Your First CSV Parse

Welcome to your first lesson with `csv-lib`. In this lesson, you will learn how to import `parseCsv`
and parse a CSV string into an array of rows.

---

## The Core Concept

At its simplest, a CSV document is a sequence of lines where each line contains fields separated by
commas (`,`). By default, `parseCsv` converts a raw CSV string into a 2D array of strings
(`CsvRow[]`, which is an alias for `string[][]`).

---

## Step 1: Parse a Basic CSV String

Create a file named `lesson-01.ts`:

```typescript
import { parseCsv } from 'csv-lib';

const csvText = ['name,age,city', 'Alice,30,New York', 'Bob,25,Chicago'].join('\n');

const rows = parseCsv(csvText);

console.log(rows);
```

Run the file with Bun:

```bash
bun lesson-01.ts
```

You will see the parsed 2D array printed to your terminal:

```text
[
  [ "name", "age", "city" ],
  [ "Alice", "30", "New York" ],
  [ "Bob", "25", "Chicago" ]
]
```

---

## Step 2: Inspecting Empty Fields

What happens when a CSV row has consecutive commas (such as `a,,c` or a trailing comma)? `parseCsv`
preserves exact positional alignment by emitting an empty string `""` for each empty cell:

```typescript
import { parseCsv } from 'csv-lib';

const sparseCsv = 'id,nickname,role\n1,,Admin\n2,Ace,';
const rows = parseCsv(sparseCsv);

console.log(rows);
// [
//   ['id', 'nickname', 'role'],
//   ['1', '', 'Admin'],
//   ['2', 'Ace', ''],
// ]
```

---

## Summary

- `parseCsv(input)` synchronously parses a complete CSV string and returns `string[][]` by default.
- Both LF (`\n`) and CRLF (`\r\n`) line endings are recognized automatically.
- Empty cells between delimiters are preserved as `""` so column indices never shift.

---

[Next: Lesson 02 — Delimiters, Quotes & Multiline Cells ➔](./lesson-02-delimiters-quotes-and-multiline.md)
