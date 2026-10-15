# 3. Stringifying & Formatting

`csv-lib` provides flexible tools for serializing 2D arrays (`CsvValue[][]`) and object records
(`Record<string, CsvValue>[]`) into RFC 4180-compliant CSV strings.

---

## One-Shot Serialization with `stringifyCsv`

`stringifyCsv` inspects the input array and automatically formats either row arrays or key-value
record objects:

### 1. Formatting Row Arrays

```typescript
import { stringifyCsv } from 'csv-lib';

const rows = [
  ['id', 'name', 'score'],
  [1, 'Alice', 98.5],
  [2, 'Bob, Jr.', 91.0],
];

const csv = stringifyCsv(rows, { lineBreak: '\n' });
// id,name,score
// 1,Alice,98.5
// 2,"Bob, Jr.",91
```

### 2. Formatting Object Records

When passed an array of objects, `stringifyCsv` automatically extracts the keys of the first record
to emit a header row (unless `header: false` is specified):

```typescript
import { stringifyCsv } from 'csv-lib';

const users = [
  { active: true, id: 1, name: 'Alice' },
  { active: false, id: 2, name: 'Bob' },
];

const csv = stringifyCsv(users, { lineBreak: '\n' });
// active,id,name
// true,1,Alice
// false,2,Bob
```

---

## Stringifier Configuration Options

All stringifier functions (`stringifyCsv`, `createCsvStringifier`, `stringifyCsvStream`,
`createCsvFormatTransformStream`, `createCsvWriter`, `writeCsvFile`, and `appendCsvFile`) accept
`CsvStringifierOptions`:

| Option      | Type       | Default  | Description                                                                        |
| :---------- | :--------- | :------- | :--------------------------------------------------------------------------------- |
| `columns`   | `string[]` | —        | Explicit column order and subset of keys to serialize when formatting records.     |
| `delimiter` | `string`   | `','`    | Field separator character.                                                         |
| `quote`     | `string`   | `'"'`    | Quote character used to wrap fields containing delimiters, quotes, or line breaks. |
| `escape`    | `string`   | `'"'`    | Escape character for quotes inside quoted fields.                                  |
| `header`    | `boolean`  | `true`   | Whether to prepend a header row when serializing record objects.                   |
| `lineBreak` | `string`   | `'\r\n'` | Record terminator string (`'\r\n'` per RFC 4180, or `'\n'` for POSIX systems).     |
| `quoted`    | `boolean`  | `false`  | When `true`, encloses every non-empty field in quotes regardless of content.       |

---

## Controlling Column Order & Filtering Keys

JavaScript object keys may not match the column order expected by downstream consumers. Pass
`columns` to control the exact column order and filter out internal properties:

```typescript
import { stringifyCsv } from 'csv-lib';

const records = [
  { internalToken: 'secret', name: 'Alice', role: 'Admin' },
  { internalToken: 'hidden', name: 'Bob', role: 'Member' },
];

const csv = stringifyCsv(records, {
  columns: ['name', 'role'],
  lineBreak: '\n',
});
// name,role
// Alice,Admin
// Bob,Member
```

---

## Supported Value Types (`CsvValue`)

Cells and record values accept any `CsvValue` (`string | number | boolean | Date | null | undefined`):

- `string`: Escaped and quoted automatically if it contains the delimiter, quote character, or
  `\r`/`\n`.
- `number` & `boolean`: Converted via `String(value)`.
- `Date`: Converted to an ISO-8601 timestamp string via `value.toISOString()`.
- `null` & `undefined`: Serialized as an empty field `''` (never `"null"` or `"undefined"`).

```typescript
import { stringifyCsv } from 'csv-lib';

const csv = stringifyCsv(
  [
    {
      createdAt: new Date('2026-10-15T12:00:00.000Z'),
      deletedAt: null,
      id: 42,
      verified: true,
    },
  ],
  { lineBreak: '\n' },
);
// createdAt,deletedAt,id,verified
// 2026-10-15T12:00:00.000Z,,42,true
```

---

## Stateful Formatting with `createCsvStringifier`

When building custom output loops, `createCsvStringifier` returns a stateful `CsvStringifier`
instance that remembers whether the header row has already been emitted across multiple
`stringifyRecord` calls:

```typescript
import { createCsvStringifier } from 'csv-lib';

const stringifier = createCsvStringifier({
  columns: ['id', 'status'],
  lineBreak: '\n',
});

// First call emits header + first record:
const chunk1 = stringifier.stringifyRecord({ id: 1, status: 'pending' });
// "id,status\n1,pending\n"

// Subsequent calls emit only the data row:
const chunk2 = stringifier.stringifyRecord({ id: 2, status: 'complete' });
// "2,complete\n"
```

---

## Next Steps

Discover how to process arbitrarily large CSV streams in constant memory in
[4. Streaming & Web Streams](./04-streaming-and-web-streams.md).

