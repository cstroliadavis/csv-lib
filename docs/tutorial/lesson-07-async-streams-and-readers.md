# Lesson 07: Async Streams & Readers

While `createCsvParser` is great for manual push loops, most modern JavaScript sources are
`AsyncIterable`s or Web `ReadableStream`s. In this lesson, you will use `parseCsvStream` and
`createCsvReader` to iterate over streaming CSV data with `for await...of`.

---

## Step 1: Streaming with `parseCsvStream`

`parseCsvStream` accepts either text chunks (`string`) or binary chunks (`Uint8Array`) and yields
parsed rows or records as soon as they complete:

```typescript
import { parseCsvStream } from 'csv-lib';

async function* networkChunks() {
  yield 'id,city\n';
  yield '1,"New ';
  yield 'York"\n2,Tokyo\n';
}

for await (const record of parseCsvStream(networkChunks(), { columns: true })) {
  console.log(record);
}
// { city: 'New York', id: '1' }
// { city: 'Tokyo', id: '2' }
```

---

## Step 2: Using `createCsvReader` for Versatile Consumption

`createCsvReader` wraps an `AsyncIterable` or `ReadableStream` in a `CsvReader` object that gives
you multiple ways to consume the stream:

1. **Async Iteration**: `for await (const row of reader)`
2. **Collect to Array**: `await reader.toArray()`
3. **Formatted Line Iteration**: `for await (const line of reader.lines())`

```typescript
import { createCsvReader } from 'csv-lib';

async function* sourceChunks() {
  yield 'country,code\nJapan,JP\nCanada,CA\n';
}

const reader = createCsvReader<{ code: string; country: string }>(sourceChunks(), {
  columns: true,
});

const countries = await reader.toArray();
console.log(countries);
// [
//   { code: 'JP', country: 'Japan' },
//   { code: 'CA', country: 'Canada' },
// ]
```

---

## Summary

- `parseCsvStream(source, options)` is an async generator that decodes `Uint8Array` or `string`
  chunks and yields rows or records.
- `createCsvReader(source, options)` provides `.toArray()`, `.lines()`, `.stream()`,
  `.pipeThrough()`, and `[Symbol.asyncIterator]`.

---

- [⬅ Previous: Lesson 06 — Incremental Push Parsing](./lesson-06-incremental-push-parsing.md)
- [Next: Lesson 08 — Web TransformStream Pipelines ➔](./lesson-08-web-transform-streams.md)

