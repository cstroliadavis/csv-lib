# 4. Streaming & Web Streams

When working with large datasets, network downloads, or real-time pipelines, loading an entire CSV
file into memory is impractical. `csv-lib` provides four complementary streaming layers so you can
choose the abstraction that best fits your architecture:

1. **Incremental Push Parser** (`createCsvParser`)
2. **Async Generators** (`parseCsvStream`, `stringifyCsvStream`)
3. **Web `TransformStream`s** (`createCsvTransformStream`, `createCsvFormatTransformStream`)
4. **High-Level Reader & Writer** (`createCsvReader`, `createCsvWriter`)

---

## 1. Incremental Push Parsing (`createCsvParser`)

At the lowest level, `createCsvParser` returns a stateful parser with `.write(chunk)`, `.end()`, and
`.reset()` methods. You can feed arbitrary string fragments—even splitting in the middle of a quoted
field, escaped quote pair, or `\r\n` sequence:

```typescript
import { createCsvParser } from 'csv-lib';

const parser = createCsvParser({ columns: true });

// Chunk 1 ends mid-field inside quotes:
const batch1 = parser.write('id,name\n1,"Ali');
// batch1 -> [] (row 1 is not yet complete)

// Chunk 2 finishes row 1 and starts row 2:
const batch2 = parser.write('ce"\n2,Bob');
// batch2 -> [{ id: '1', name: 'Alice' }]

// Flush remaining buffered characters at end-of-input:
const batch3 = parser.end();
// batch3 -> [{ id: '2', name: 'Bob' }]
```

---

## 2. Async Generators (`parseCsvStream` & `stringifyCsvStream`)

### Consuming Byte or Text Streams with `parseCsvStream`

`parseCsvStream` accepts any `AsyncIterable<Uint8Array | string>` or
`ReadableStream<Uint8Array | string>` (such as `fetch(url).then(r => r.body!)` or
`Bun.file(path).stream()`) and yields parsed rows or records as they complete:

```typescript
import { parseCsvStream } from 'csv-lib';

const response = await fetch('https://example.com/large-dataset.csv');

if (response.body) {
  for await (const record of parseCsvStream(response.body, { columns: true })) {
    console.log(record);
  }
}
```

### Streaming Formatted CSV Lines with `stringifyCsvStream`

`stringifyCsvStream` takes an `AsyncIterable` of rows or records and yields serialized CSV lines:

```typescript
import { stringifyCsvStream } from 'csv-lib';

async function* fetchDatabaseRows() {
  yield { id: 1, name: 'Alice' };
  yield { id: 2, name: 'Bob' };
}

for await (const csvLine of stringifyCsvStream(fetchDatabaseRows(), { lineBreak: '\n' })) {
  process.stdout.write(csvLine);
}
```

---

## 3. Web `TransformStream` Pipelines

For standard Web Streams (`pipeThrough` / `pipeTo`), use `createCsvTransformStream` and
`createCsvFormatTransformStream`:

```typescript
import {
  createCsvFormatTransformStream,
  createCsvTransformStream,
  toReadableStream,
} from 'csv-lib';

interface RawRow {
  amount: string;
  id: string;
}

const inputStream = Bun.file('transactions.csv').stream();

// Parse bytes -> filter/transform records -> format back to CSV strings
const csvOutputStream = inputStream
  .pipeThrough(createCsvTransformStream<RawRow>({ columns: true }))
  .pipeThrough(
    new TransformStream<RawRow, Record<string, unknown>>({
      transform(row, controller) {
        if (Number(row.amount) >= 100) {
          controller.enqueue({ amount: Number(row.amount), id: row.id, status: 'HIGH_VALUE' });
        }
      },
    }),
  )
  .pipeThrough(createCsvFormatTransformStream({ lineBreak: '\n' }));
```

Use `toReadableStream(asyncIterable)` whenever you need to adapt an `AsyncGenerator` or
`AsyncIterable` into a Web `ReadableStream`.

---

## 4. High-Level `createCsvReader` & `createCsvWriter`

### `createCsvReader`

Wraps a stream or async iterable with convenient consumption helpers:

- `for await (const row of reader)` — direct async iteration.
- `await reader.toArray()` — collects all rows/records into an array.
- `reader.lines()` — yields re-serialized CSV string lines.
- `reader.stream()` — returns a `ReadableStream<T>`.
- `reader.pipeThrough(transform)` — pipes parsed items through a `TransformStream`.

```typescript
import { createCsvReader } from 'csv-lib';

const reader = createCsvReader(Bun.file('users.csv').stream(), { columns: true });
const allUsers = await reader.toArray();
```

### `createCsvWriter`

Streams serialized CSV rows or records directly to a file path (via `Bun.file(path).writer()`) or a
`WritableStream`:

```typescript
import { createCsvWriter } from 'csv-lib';

const writer = createCsvWriter('export.csv', {
  columns: ['id', 'name'],
  lineBreak: '\n',
});

await writer.writeRecord({ id: 1, name: 'Alice' });
await writer.writeRecord({ id: 2, name: 'Bob' });
await writer.flush();
await writer.close();
```

---

## Next Steps

Explore dedicated disk I/O helpers in [5. File Operations](./05-file-operations.md).

