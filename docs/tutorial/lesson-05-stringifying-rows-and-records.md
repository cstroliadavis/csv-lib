# Lesson 05: Stringifying Rows & Records

Now that you can parse CSV data, let's generate RFC 4180 CSV strings from JavaScript arrays and
objects using `stringifyCsv` and `createCsvStringifier`.

---

## Step 1: Serializing 2D Row Arrays

Pass a 2D array of values (`string`, `number`, `boolean`, `Date`, `null`, or `undefined`) to
`stringifyCsv`:

```typescript
import { stringifyCsv } from 'csv-lib';

const rows = [
  ['name', 'score', 'active', 'notes'],
  ['Alice', 99.5, true, ' Said "Great!"'],
  ['Bob', 85, false, null],
];

// Default lineBreak is '\r\n' (RFC 4180); pass '\n' for POSIX newlines
const csv = stringifyCsv(rows, { lineBreak: '\n' });

console.log(csv);
// name,score,active,notes
// Alice,99.5,true," Said ""Great!"""
// Bob,85,false,
```

Notice how `" Said ""Great!"""` was automatically wrapped in quotes and its internal quotes were
doubled, while `null` became an empty cell.

---

## Step 2: Serializing Record Objects with Column Ordering

When you pass an array of objects to `stringifyCsv`, it emits a header row automatically. You can
specify `columns` to define the exact column sequence:

```typescript
import { stringifyCsv } from 'csv-lib';

const users = [
  { age: 30, name: 'Alice', role: 'Engineer' },
  { age: 25, name: 'Bob', role: 'Designer' },
];

const csv = stringifyCsv(users, {
  columns: ['name', 'role', 'age'],
  lineBreak: '\n',
});

console.log(csv);
// name,role,age
// Alice,Engineer,30
// Bob,Designer,25
```

---

## Step 3: Using `createCsvStringifier` for Fine-Grained Control

If you want to format single rows or records one at a time, create a reusable stringifier instance:

```typescript
import { createCsvStringifier } from 'csv-lib';

const stringifier = createCsvStringifier({
  lineBreak: '\n',
  quoted: true, // Wrap every non-empty cell in quotes
});

console.log(stringifier.stringifyRow(['Alice', 30]));
// "Alice","30"\n
```

---

## Summary

- `stringifyCsv(data, options)` formats both `CsvValue[][]` and `Record<string, CsvValue>[]`.
- Cells containing delimiters, quotes, or line breaks are automatically quoted and escaped.
- Use `columns` to control column order and `quoted: true` to force quotes around all non-empty
  fields.

---

- [⬅ Previous: Lesson 04 — Cleaning Messy Input](./lesson-04-cleaning-messy-input.md)
- [Next: Lesson 06 — Incremental Push Parsing ➔](./lesson-06-incremental-push-parsing.md)

