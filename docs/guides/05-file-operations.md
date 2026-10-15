# 5. File Operations

`csv-lib` includes first-class file utilities built directly on top of `Bun.file` and `Bun.write`
for fast, ergonomic disk I/O.

---

## Reading an Entire File (`readCsvFile`)

Use `readCsvFile` when you want to read and parse a CSV file on disk into an in-memory array of rows
or typed records:

```typescript
import { readCsvFile } from 'csv-lib';

interface ProductRecord {
  id: string;
  price: string;
  title: string;
}

// 1. Read as 2D string arrays (CsvRow[])
const rawRows = await readCsvFile('./data/products.csv');

// 2. Read as typed record objects (ProductRecord[])
const products = await readCsvFile<ProductRecord>('./data/products.csv', {
  columns: true,
  skipEmptyLines: true,
  trim: true,
});
```

---

## Streaming a File Row-by-Row (`streamCsvFile`)

For large files that should not be buffered in memory at once, `streamCsvFile` streams chunks from
`Bun.file(filePath).stream()` and yields one parsed row or record at a time:

```typescript
import { streamCsvFile } from 'csv-lib';

let count = 0;

for await (const record of streamCsvFile('./data/events.csv', { columns: true })) {
  count += 1;
}

console.log(`Processed ${count} events in constant memory.`);
```

---

## Writing to a File (`writeCsvFile`)

`writeCsvFile` writes either an in-memory array (of rows or records) or an `AsyncIterable` stream
directly to disk, returning a `Promise<number>` with the total bytes written:

### 1. Writing an In-Memory Array

```typescript
import { writeCsvFile } from 'csv-lib';

const bytesWritten = await writeCsvFile(
  './output/report.csv',
  [
    { department: 'Engineering', headcount: 42 },
    { department: 'Design', headcount: 12 },
  ],
  { lineBreak: '\n' },
);
```

### 2. Streaming an Async Generator Directly to Disk

When passed an `AsyncIterable`, `writeCsvFile` opens a `Bun.file(filePath).writer()` sink and
streams each serialized line incrementally without building the full CSV string in memory:

```typescript
import { writeCsvFile } from 'csv-lib';

async function* generateMetrics() {
  for (let i = 1; i <= 10_000; i += 1) {
    yield { metricId: i, value: Math.random().toFixed(4) };
  }
}

await writeCsvFile('./output/metrics.csv', generateMetrics(), { lineBreak: '\n' });
```

---

## Appending to Existing Files (`appendCsvFile`)

Appending records to a CSV log or audit trail normally requires checking whether the file already
exists so you don't write duplicate header rows in the middle of the file.

`appendCsvFile` handles this automatically:

- **If the file does not exist or is `0` bytes**: The header row is written (when `header !== false`
  and formatting records), followed by the data rows.
- **If the file already has content**: The header row is automatically suppressed, and only the new
  data rows are appended.

```typescript
import { appendCsvFile } from 'csv-lib';

// First call creates audit.csv and writes:
// timestamp,actor,action
// 2026-10-15T12:00:00Z,alice,login
await appendCsvFile(
  './output/audit.csv',
  [{ action: 'login', actor: 'alice', timestamp: '2026-10-15T12:00:00Z' }],
  { lineBreak: '\n' },
);

// Second call detects existing content and appends ONLY the data row:
// 2026-10-15T12:05:00Z,alice,export
await appendCsvFile(
  './output/audit.csv',
  [{ action: 'export', actor: 'alice', timestamp: '2026-10-15T12:05:00Z' }],
  { lineBreak: '\n' },
);
```

---

## Next Steps

See practical production patterns in [6. Recipes & Cookbook](./06-recipes-and-cookbook.md).

