# Hands-On Tutorial: Mastering `csv-lib`

Welcome to the step-by-step hands-on tutorial for `csv-lib`. This course takes you from parsing your
first CSV string to building constant-memory streaming ETL pipelines with Web `TransformStream`s and
`Bun.file`.

---

## Course Roadmap

The tutorial consists of **10 progressive lessons** organized into 4 modules. Each lesson builds
directly on the concepts introduced in the previous one:

### Module 1: Core Parsing & Cleaning

- [Lesson 01: Your First CSV Parse](./lesson-01-first-parse.md) — Parsing CSV text into 2D row
  arrays with `parseCsv`.
- [Lesson 02: Delimiters, Quotes & Multiline Cells](./lesson-02-delimiters-quotes-and-multiline.md)
  — Handling TSV/semicolon delimiters, escaped double quotes, and embedded line breaks.
- [Lesson 03: Headers & Typed Records](./lesson-03-headers-and-typed-records.md) — Mapping rows to
  typed key-value objects using `columns: true` and explicit column arrays.
- [Lesson 04: Cleaning Messy Input](./lesson-04-cleaning-messy-input.md) — Trimming unquoted
  whitespace, skipping blank lines, and stripping UTF-8 BOMs.

### Module 2: Generating CSV Output

- [Lesson 05: Stringifying Rows & Records](./lesson-05-stringifying-rows-and-records.md) —
  Formatting arrays and objects into RFC 4180 CSV with `stringifyCsv` and `createCsvStringifier`.

### Module 3: Streaming & Web Pipelines

- [Lesson 06: Incremental Push Parsing](./lesson-06-incremental-push-parsing.md) — Feeding arbitrary
  chunks into a stateful parser with `createCsvParser`.
- [Lesson 07: Async Streams & Readers](./lesson-07-async-streams-and-readers.md) — Consuming async
  iterables with `parseCsvStream` and `createCsvReader`.
- [Lesson 08: Web TransformStream Pipelines](./lesson-08-web-transform-streams.md) — Composing
  `createCsvTransformStream` and `createCsvFormatTransformStream` with `.pipeThrough()`.

### Module 4: Disk I/O & Production ETL

- [Lesson 09: Reading, Writing & Appending Files](./lesson-09-reading-and-writing-files.md) —
  Working with disk files via `readCsvFile`, `streamCsvFile`, `writeCsvFile`, and `appendCsvFile`.
- [Lesson 10: Building a Streaming ETL Pipeline](./lesson-10-building-an-etl-pipeline.md) —
  Combining streaming file reads, record transformation, and `createCsvWriter` in an end-to-end
  workflow.

---

Ready to begin? Start with [Lesson 01: Your First CSV Parse ➔](./lesson-01-first-parse.md).

