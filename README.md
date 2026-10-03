# csv-lib

A lightweight, zero-dependency CSV library built for **Bun (v1.4.2)**.

Handles RFC 4180-compliant parsing and writing, including multiline cells with
newlines, embedded double quotes (`""`), custom delimiters, UTF-8 BOM, and
chunk-by-chunk file streaming via native Web Streams.

## Features

- **Zero Third-Party Dependencies**: Uses only Bun's built-in APIs and standard
  Web Streams.
- **Streaming State Machine**: Processes chunks of arbitrary sizes (even 1-byte
  chunks) without buffering full files in memory.
- **RFC 4180 Compliance**: Correctly escapes embedded quotes (`""` -> `"`),
  multiline cells containing `\r\n` or `\n`, commas, and whitespace.
- **Record Mapping**: Easily transform rows into typed JavaScript objects
  (`{ columns: true }`).
- **High-Level File Helpers**: `readCsvFile`, `writeCsvFile`, `appendCsvFile`,
  and `streamCsvFile` powered by `Bun.file`.
- **Web Streams**: Native `TransformStream` implementations for parsing and
  stringifying.
- **Full TypeScript Support**: Comprehensive types and strict type safety out of
  the box.

## Installation & Setup

```bash
bun test
```

## Quick Start

### 1. Simple Parsing & Stringifying

```ts
import { parseCsv, stringifyCsv } from './index.ts';

// Parse CSV text into 2D array of rows
const rows = parseCsv('name,score\nAlice,95\nBob,88');
// [ ['name', 'score'], ['Alice', '95'], ['Bob', '88'] ]

// Parse with header mapping into objects
const records = parseCsv('name,score\nAlice,95', { columns: true });
// [ { name: 'Alice', score: '95' } ]

// Serialize array of objects back to CSV
const csv = stringifyCsv([
  { age: 30, name: 'Alice' },
  { age: 25, name: 'Bob' },
]);
```

### 2. Streaming File Reading

Stream large files row by row without buffering the entire file:

```ts
import { streamCsvFile } from './index.ts';

for await (const row of streamCsvFile('large_dataset.csv', { columns: true })) {
  console.log(row.name, row.score);
}
```

### 3. File Writing & Appending

```ts
import { appendCsvFile, readCsvFile, writeCsvFile } from './index.ts';

// Write records with headers
await writeCsvFile('users.csv', [
  { city: 'Tokyo', name: 'Alice' },
  { city: 'London', name: 'Bob' },
]);

// Append new records (automatically omits duplicate header line)
await appendCsvFile('users.csv', [{ city: 'Paris', name: 'Charlie' }]);

// Read back entire file
const users = await readCsvFile('users.csv', { columns: true });
```

### 4. Embedded Quotes & Multiline Cells

```ts
import { parseCsv, stringifyCsv } from './index.ts';

const original = [
  ['Quote', 'Multiline Note'],
  ['He said "Hello!"', 'Line 1\nLine 2\nLine 3'],
];

const csv = stringifyCsv(original);
// Quote,Multiline Note
// "He said ""Hello!""","Line 1
// Line 2
// Line 3"

const parsed = parseCsv(csv);
// Perfectly roundtrips back to original data!
```

### 5. Web TransformStream Integration

Use standard Web Streams to pipe byte or text streams:

```ts
import { createCsvTransformStream } from './index.ts';

const response = await fetch('https://example.com/data.csv');
const transform = createCsvTransformStream({ columns: true });
const recordStream = response.body.pipeThrough(transform);

for await (const record of recordStream) {
  console.log(record);
}
```

<!-- markdownlint-disable MD013 -->

## API Reference

### Parser Functions

- `parseCsv<T>(text: string, options?: CsvParserOptions): T[]`
- `parseCsvStream<T>(source: AsyncIterable<string | Uint8Array>, options?: CsvParserOptions): AsyncGenerator<T>`
- `createCsvParser(options?: CsvParserOptions): CsvParser`

### Stringifier Functions

- `stringifyCsv(data: CsvValue[][] | Record<string, CsvValue>[], options?: CsvStringifierOptions): string`
- `stringifyCsvStream(items: AsyncIterable<CsvValue[] | Record<string, CsvValue>>, options?: CsvStringifierOptions): AsyncGenerator<string>`
- `createCsvStringifier(options?: CsvStringifierOptions): CsvStringifier`

### Stream & Pipeline Functions

- `createCsvTransformStream<T>(options?: CsvParserOptions): TransformStream<Uint8Array | string, T>`
- `createCsvFormatTransformStream(options?: CsvStringifierOptions): TransformStream<CsvValue[] | Record<string, CsvValue>, string>`
- `createCsvReader<T>(source: AsyncIterable<Uint8Array | string>, options?: CsvParserOptions): CsvReader<T>`
- `createCsvWriter(destination: string | WritableStream, options?: CsvStringifierOptions): CsvWriter`

### File Operations (`Bun.file`)

- `readCsvFile<T>(filePath: string, options?: CsvParserOptions): Promise<T[]>`
- `streamCsvFile<T>(filePath: string, options?: CsvParserOptions): AsyncGenerator<T>`
- `writeCsvFile(filePath: string, data: ... , options?: CsvStringifierOptions): Promise<number>`
- `appendCsvFile(filePath: string, data: ... , options?: CsvStringifierOptions): Promise<void>`

<!-- markdownlint-restore -->

## Building for Distribution

Build the production ESM bundle and TypeScript declaration files:

```bash
# Clean, bundle with Bun, and emit type declarations (.d.ts) into dist/
bun run build
```

The resulting `dist/` directory contains:

- `dist/index.js`: Self-contained ESM bundle with external source maps.
- `dist/index.d.ts`: TypeScript entrypoint declaration.
- `dist/src/*.d.ts`: Module declaration files.

## Developer Documentation

Generate interactive HTML documentation from JSDoc comments via TypeDoc:

```bash
# Generate HTML documentation into docs/
bun run docs

# Watch mode for documentation development
bun run docs:watch
```

## Testing, Linting & Formatting

Run tests, code style verification, and TypeScript typechecking:

```bash
# Run tests with Bun's native test runner
bun run test

# Run ESLint check
bun run lint

# Automatically fix ESLint errors
bun run lint:fix

# Format files using Prettier
bun run format

# Format files using oxfmt
bun run oxfmt

# TypeScript strict type checking
bun run typecheck
```
