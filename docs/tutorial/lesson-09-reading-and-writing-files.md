# Lesson 09: Reading, Writing & Appending Files

In this lesson, you will use `csv-lib`'s `Bun.file`-powered disk helpers (`writeCsvFile`,
`readCsvFile`, `streamCsvFile`, and `appendCsvFile`) to manage CSV files on disk.

---

## Step 1: Writing and Reading a CSV File

`writeCsvFile` writes an array of rows, an array of records, or an `AsyncIterable` directly to disk.
`readCsvFile` reads and parses the file back into memory:

```typescript
import { readCsvFile, writeCsvFile } from 'csv-lib';

const users = [
  { city: 'Tokyo', name: 'Aiko' },
  { city: 'Paris', name: 'Camille' },
];

// 1. Write records to disk with a header row
await writeCsvFile('./users.csv', users, { lineBreak: '\n' });

// 2. Read them back as typed records
const loaded = await readCsvFile<{ city: string; name: string }>('./users.csv', {
  columns: true,
});

console.log(loaded);
// [
//   { city: 'Tokyo', name: 'Aiko' },
//   { city: 'Paris', name: 'Camille' },
// ]
```

---

## Step 2: Appending Records Without Duplicate Headers

When appending new records to `./users.csv` with `appendCsvFile`, `csv-lib` checks if the file
already exists and has content. Because `./users.csv` is non-empty, `appendCsvFile` suppresses the
header row automatically:

```typescript
import { appendCsvFile, readCsvFile } from 'csv-lib';

await appendCsvFile('./users.csv', [{ city: 'Toronto', name: 'Liam' }], {
  lineBreak: '\n',
});

const allUsers = await readCsvFile('./users.csv', { columns: true });
console.log(allUsers.length);
// 3
```

---

## Step 3: Streaming Large Files from Disk

When a file is too large to load into an array at once, iterate over `streamCsvFile`:

```typescript
import { streamCsvFile } from 'csv-lib';

for await (const user of streamCsvFile<{ city: string; name: string }>('./users.csv', {
  columns: true,
})) {
  console.log(`${user.name} (${user.city})`);
}
```

---

## Summary

- `writeCsvFile(path, data, options)` writes arrays or async streams to disk and returns the byte
  count.
- `readCsvFile(path, options)` parses an entire file into an array of rows or records.
- `appendCsvFile(path, data, options)` appends rows or records, emitting a header only if the file
  is new or empty.
- `streamCsvFile(path, options)` yields rows or records one by one from `Bun.file(path).stream()`.

---

- [⬅ Previous: Lesson 08 — Web TransformStream Pipelines](./lesson-08-web-transform-streams.md)
- [Next: Lesson 10 — Building a Streaming ETL Pipeline ➔](./lesson-10-building-an-etl-pipeline.md)

