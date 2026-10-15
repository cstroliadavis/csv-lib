# Lesson 08: Web TransformStream Pipelines

Standard Web Streams (`ReadableStream`, `TransformStream`, `WritableStream`) allow composable data
pipelines with automatic backpressure. In this lesson, you will chain `createCsvTransformStream` and
`createCsvFormatTransformStream` using `.pipeThrough()`.

---

## Step 1: Parsing Chunks with `createCsvTransformStream`

`createCsvTransformStream` transforms a `ReadableStream<Uint8Array | string>` into a
`ReadableStream<CsvRow | CsvRecord>`:

```typescript
import { createCsvTransformStream, toReadableStream } from 'csv-lib';

async function* rawChunks() {
  yield 'name,role\n';
  yield 'Alice,Engineer\n';
  yield 'Bob,Designer\n';
}

const parsedStream = toReadableStream(rawChunks()).pipeThrough(
  createCsvTransformStream<{ name: string; role: string }>({ columns: true }),
);

for await (const record of parsedStream) {
  console.log(record);
}
// { name: 'Alice', role: 'Engineer' }
// { name: 'Bob', role: 'Designer' }
```

---

## Step 2: Serializing Items with `createCsvFormatTransformStream`

To convert a stream of rows or records back into formatted CSV text chunks, pipe through
`createCsvFormatTransformStream`:

```typescript
import {
  createCsvFormatTransformStream,
  createCsvTransformStream,
  toReadableStream,
} from 'csv-lib';

async function* inputChunks() {
  yield 'name,score\nAlice,95\nBob,82\n';
}

// Parse CSV -> uppercase names -> format back to semicolon-separated CSV
const pipeline = toReadableStream(inputChunks())
  .pipeThrough(createCsvTransformStream<{ name: string; score: string }>({ columns: true }))
  .pipeThrough(
    new TransformStream({
      transform(record, controller) {
        controller.enqueue({
          name: record.name.toUpperCase(),
          score: Number(record.score),
        });
      },
    }),
  )
  .pipeThrough(
    createCsvFormatTransformStream({
      delimiter: ';',
      lineBreak: '\n',
    }),
  );

for await (const csvLine of pipeline) {
  process.stdout.write(csvLine);
}
// name;score
// ALICE;95
// BOB;82
```

---

## Summary

- `toReadableStream(iterable)` converts any `AsyncIterable` into a Web `ReadableStream`.
- `createCsvTransformStream(options)` parses incoming byte or string chunks into rows or records.
- `createCsvFormatTransformStream(options)` formats incoming rows or records into CSV text lines.

---

- [⬅ Previous: Lesson 07 — Async Streams & Readers](./lesson-07-async-streams-and-readers.md)
- [Next: Lesson 09 — Reading, Writing & Appending Files ➔](./lesson-09-reading-and-writing-files.md)

