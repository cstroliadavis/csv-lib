# `csv-lib` Developer Guide

Welcome to the comprehensive developer guide for `csv-lib`, a lightweight, zero-dependency,
RFC 4180-compliant streaming CSV parser and stringifier built for Bun and modern TypeScript.

---

## Architectural Philosophy

Many CSV libraries force a trade-off between ergonomics and memory efficiency—either loading entire
files into memory for convenience or exposing complex callback APIs for streaming.

`csv-lib` bridges both worlds with a layered architecture built around a single-pass state machine:

```text
[ In-Memory Strings ]   [ AsyncIterables / ReadableStreams ]   [ Bun.file Disk I/O ]
          │                              │                               │
          ▼                              ▼                               ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │             Core Single-Pass State Machine & Stringifier                  │
   │        (createCsvParser / ParserState / createCsvStringifier)             │
   └───────────────────────────────────────────────────────────────────────────┘
          │                              │                               │
          ▼                              ▼                               ▼
  [ CsvRow[] / CsvRecord[] ]   [ Web TransformStreams ]       [ File & Stream Sinks ]
```

- **Zero External Dependencies**: Relies exclusively on native Web Streams (`ReadableStream`,
  `WritableStream`, `TransformStream`), `TextDecoder`, and `Bun.file` APIs.
- **Chunk-Boundary Safe**: Embedded newlines, escaped double quotes (`""`), CRLF sequences split
  across network/file buffers, and UTF-8 Byte Order Marks (`\uFEFF`) are handled seamlessly across
  arbitrary chunk boundaries.
- **Symmetric API Surface**: Every operation—parsing, stringifying, streaming, and file I/O—works
  symmetrically with both 2D arrays (`CsvRow`) and keyed objects (`CsvRecord`).

---

## Guide Directory

Follow these guides to master every capability of `csv-lib`:

| Guide                                                                      | Description                                                                                        |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| [1. Getting Started & Parsing](./guides/01-getting-started-and-parsing.md) | Core parsing with `parseCsv`, custom delimiters, quoting rules, trimming, and BOM stripping.       |
| [2. Headers & Record Mapping](./guides/02-headers-and-record-mapping.md)   | Transforming rows into typed `CsvRecord` objects using header discovery or explicit column arrays. |
| [3. Stringifying & Formatting](./guides/03-stringifying-and-formatting.md) | Serializing arrays and objects to RFC 4180 CSV with `stringifyCsv` and `createCsvStringifier`.     |
| [4. Streaming & Web Streams](./guides/04-streaming-and-web-streams.md)     | Incremental push parsing, async generators, Web `TransformStream` pipelines, readers, and writers. |
| [5. File Operations](./guides/05-file-operations.md)                       | Reading, streaming, writing, and appending CSV files on disk using native `Bun.file` helpers.      |
| [6. Recipes & Cookbook](./guides/06-recipes-and-cookbook.md)               | Production patterns for ETL pipelines, HTTP streaming in `Bun.serve()`, TSV files, and unit tests. |

---

## Hands-On Tutorial (10 Lessons)

New to `csv-lib`? Walk through our progressive [10-Lesson Hands-On Tutorial](./tutorial/README.md):

- **Module 1: Core Parsing & Cleaning**
  ([Lesson 1](./tutorial/lesson-01-first-parse.md) –
  [Lesson 4](./tutorial/lesson-04-cleaning-messy-input.md))
- **Module 2: Generating CSV Output**
  ([Lesson 5](./tutorial/lesson-05-stringifying-rows-and-records.md))
- **Module 3: Streaming & Web Pipelines**
  ([Lesson 6](./tutorial/lesson-06-incremental-push-parsing.md) –
  [Lesson 8](./tutorial/lesson-08-web-transform-streams.md))
- **Module 4: Disk I/O & Production ETL**
  ([Lesson 9](./tutorial/lesson-09-reading-and-writing-files.md) –
  [Lesson 10](./tutorial/lesson-10-building-an-etl-pipeline.md))

---

## API Reference

For detailed TypeScript type definitions, interfaces, and function signatures, consult the
[TypeDoc API Reference](./api-reference/index.html) (generated via `bun run docs`).
