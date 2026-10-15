# 1. Getting Started & Parsing

This guide covers synchronous in-memory CSV parsing with `parseCsv` and `createCsvParser`,
configuring delimiters and quote rules, and handling real-world formatting quirks.

---

## Quick Start with `parseCsv`

For complete CSV strings already in memory, `parseCsv` parses the input in a single pass and returns
an array of rows (`CsvRow[]`, where each row is `string[]`):

```typescript
import { parseCsv } from 'csv-lib';

const raw = 'id,name,role\n1,Alice,Engineer\n2,Bob,Designer';
const rows = parseCsv(raw);

console.log(rows);
// [
//   ['id', 'name', 'role'],
//   ['1', 'Alice', 'Engineer'],
//   ['2', 'Bob', 'Designer'],
// ]
```

---

## Parser Configuration Options

All parsing functions (`parseCsv`, `createCsvParser`, `parseCsvStream`, `createCsvReader`,
`createCsvTransformStream`, `readCsvFile`, and `streamCsvFile`) accept a `CsvParserOptions` object:

| Option           | Type                  | Default | Description                                                                          |
| :--------------- | :-------------------- | :------ | :----------------------------------------------------------------------------------- |
| `columns`        | `boolean \| string[]` | `false` | When `true`, uses the first row as object keys. When `string[]`, maps to those keys. |
| `delimiter`      | `string`              | `','`   | Single-character field separator (e.g., `','`, `'\t'`, `';'`, `'\|'`).               |
| `quote`          | `string`              | `'"'`   | Character used to enclose fields containing delimiters, quotes, or newlines.         |
| `escape`         | `string`              | `'"'`   | Character used to escape a quote character inside a quoted field.                    |
| `trim`           | `boolean`             | `false` | Trims leading and trailing spaces/tabs around unquoted fields.                       |
| `skipEmptyLines` | `boolean`             | `false` | Ignores completely empty lines (`\n` or `\r\n` with no fields).                      |

---

## RFC 4180 Quoting, Escaping & Multiline Fields

`csv-lib` implements the full RFC 4180 state machine:

### 1. Escaped Quotes

Inside a quoted field, doubled quote characters (`""`) resolve to a single literal quote (`"`):

```typescript
const csv = 'speaker,line\n"Alice","She said ""Hello!"" to Bob"';
const rows = parseCsv(csv);
// [['speaker', 'line'], ['Alice', 'She said "Hello!" to Bob']]
```

If your data source uses backslash escaping (`\"`) instead of doubled quotes, set `escape: '\\'`:

```typescript
const rows = parseCsv('id,note\n1,"Escaped \\"quote\\" here"', {
  escape: '\\',
});
// [['id', 'note'], ['1', 'Escaped "quote" here']]
```

### 2. Multiline Cells

Line breaks (`\n` or `\r\n`) inside quoted fields are preserved verbatim as part of the cell value
rather than splitting the row:

```typescript
const csv = 'id,address\n1,"123 Main St\nApt 4B\nNew York, NY"';
const rows = parseCsv(csv);
// [['id', 'address'], ['1', '123 Main St\nApt 4B\nNew York, NY']]
```

---

## Custom Delimiters (TSV, Semicolon, Pipe)

To parse Tab-Separated Values (TSV) or European semicolon-delimited exports, pass `delimiter`:

```typescript
const tsv = 'sku\tprice\tinStock\nA-100\t19.99\ttrue';
const rows = parseCsv(tsv, { delimiter: '\t' });
// [['sku', 'price', 'inStock'], ['A-100', '19.99', 'true']]
```

---

## Whitespace Trimming & Empty Lines

### Trimming Unquoted Fields (`trim: true`)

When `trim: true` is enabled, spaces surrounding unquoted fields are stripped while whitespace
inside quotes is preserved:

```typescript
const csv = '  name , "paddedNote" , score \n  Alice , "  keep me  " , 95 ';
const rows = parseCsv(csv, { trim: true });
// [
//   ['name', 'paddedNote', 'score'],
//   ['Alice', '  keep me  ', '95'],
// ]
```

### Skipping Blank Lines (`skipEmptyLines: true`)

Many exported CSV files include trailing newlines or blank separator lines. Enable `skipEmptyLines`
to omit empty rows:

```typescript
const csv = 'a,b\n\n1,2\r\n\r\n3,4\n';
const rows = parseCsv(csv, { skipEmptyLines: true });
// [['a', 'b'], ['1', '2'], ['3', '4']]
```

---

## Automatic UTF-8 BOM Stripping

Files exported from Excel often begin with a UTF-8 Byte Order Mark (`\uFEFF`). `csv-lib`
automatically strips a leading BOM on the first chunk so your first header or cell name is never
corrupted:

```typescript
const excelCsv = '\uFEFFid,name\n1,Alice';
const rows = parseCsv(excelCsv);
// rows[0][0] is 'id' (not '\uFEFFid')
```

---

## Next Steps

Learn how to automatically map rows into typed key-value objects in
[2. Headers & Record Mapping](./02-headers-and-record-mapping.md).

