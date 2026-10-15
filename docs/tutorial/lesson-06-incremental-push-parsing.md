# Lesson 06: Incremental Push Parsing

When receiving CSV data over a network socket, WebSocket, or custom buffer reader, chunks rarely
align neatly on line breaks. In this lesson, you will use `createCsvParser` to feed arbitrary string
slices into a stateful parser.

---

## Step 1: Feeding Split Chunks with `.write()` and `.end()`

`createCsvParser` returns an object with `.write(chunk)`, `.end()`, `.reset()`, and `.parse(input)`:

- `parser.write(chunk)` scans the incoming string and returns any rows that were completed during
  that chunk. Incomplete trailing fields remain buffered inside the parser state.
- `parser.end()` flushes the final buffered row when the stream closes.

```typescript
import { createCsvParser } from 'csv-lib';

const parser = createCsvParser({ columns: true });

// Chunk 1 stops mid-word inside a quoted field:
const out1 = parser.write('id,name\n1,"Al');
console.log('After chunk 1:', out1);
// [] (header was captured, row 1 is still open)

// Chunk 2 finishes row 1 and starts row 2 without a trailing newline:
const out2 = parser.write('ice"\n2,Bob');
console.log('After chunk 2:', out2);
// [{ id: '1', name: 'Alice' }]

// End of input flushes row 2:
const out3 = parser.end();
console.log('After end():', out3);
// [{ id: '2', name: 'Bob' }]
```

---

## Step 2: Reusing a Parser Instance with `.reset()`

Calling `parser.reset()` clears all internal buffers and header state (while preserving any explicit
`columns: string[]` configuration), allowing you to reuse the same parser instance on a new stream:

```typescript
parser.reset();
const rows = parser.parse('id,name\n10,Charlie');
console.log(rows);
// [{ id: '10', name: 'Charlie' }]
```

---

## Summary

- `parser.write(chunk)` processes arbitrary fragments and returns completed rows immediately.
- `parser.end()` flushes any remaining partial row at the end of input and resets the parser.
- `parser.reset()` clears internal state so the parser can be reused cleanly.

---

- [⬅ Previous: Lesson 05 — Stringifying Rows & Records](./lesson-05-stringifying-rows-and-records.md)
- [Next: Lesson 07 — Async Streams & Readers ➔](./lesson-07-async-streams-and-readers.md)

