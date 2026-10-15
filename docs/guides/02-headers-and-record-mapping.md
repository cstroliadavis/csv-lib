# 2. Headers & Record Mapping

By default, `csv-lib` emits each row as a `CsvRow` (`string[]`). When working with structured tabular
data, you can instruct the parser to emit `CsvRecord` objects (`Record<string, string>`) or custom
TypeScript interfaces using the `columns` option.

---

## Automatic Header Discovery (`columns: true`)

When `columns: true` is passed in `CsvParserOptions`, the parser captures the first non-empty row as
the list of property names and maps every subsequent row into a key-value object:

```typescript
import { parseCsv } from 'csv-lib';

const csv = ['id,email,plan', 'u_101,alice@example.com,pro', 'u_102,bob@example.com,starter'].join(
  '\n',
);

const records = parseCsv(csv, { columns: true });

console.log(records);
// [
//   { email: 'alice@example.com', id: 'u_101', plan: 'pro' },
//   { email: 'bob@example.com', id: 'u_102', plan: 'starter' },
// ]
```

> [!NOTE]
> The header row itself is consumed to establish column names and is not emitted as a data record.

---

## Explicit Column Definitions (`columns: string[]`)

If a CSV file does not contain a header row, passes custom column names in an array. Every row—
including the very first row—is mapped using the provided column list:

```typescript
import { parseCsv } from 'csv-lib';

const headerlessCsv = '2026-10-15,INFO,Server listening on 3000\n2026-10-15,WARN,High memory usage';

const logs = parseCsv(headerlessCsv, {
  columns: ['timestamp', 'level', 'message'],
});

console.log(logs);
// [
//   { level: 'INFO', message: 'Server listening on 3000', timestamp: '2026-10-15' },
//   { level: 'WARN', message: 'High memory usage', timestamp: '2026-10-15' },
// ]
```

---

## Type-Safe Generic Records

All parsing and reader functions accept a generic type parameter `T` so you can strongly type the
returned records without manual casting:

```typescript
import { parseCsv, readCsvFile } from 'csv-lib';

interface EmployeeRecord {
  department: string;
  id: string;
  name: string;
}

const employees = parseCsv<EmployeeRecord>(
  'id,name,department\n1,Alice,Engineering\n2,Bob,Product',
  { columns: true },
);

// TypeScript knows `employees[0]?.department` is `string`
console.log(employees[0]?.department);
```

This works identically with streaming and file functions:

```typescript
const rows = await readCsvFile<EmployeeRecord>('employees.csv', {
  columns: true,
  skipEmptyLines: true,
});
```

---

## Handling Ragged Rows (Missing or Extra Cells)

Real-world CSV files occasionally have rows with fewer or more fields than the header row:

- **Fewer cells than headers**: Missing trailing fields default to the empty string `''` so every
  record maintains a consistent shape with all header keys present.
- **More cells than headers**: Extra cells beyond the defined column headers are ignored.

```typescript
import { parseCsv } from 'csv-lib';

const raggedCsv = 'id,name,notes\n1,Alice\n2,Bob,Completed onboarding,extra_ignored';
const records = parseCsv(raggedCsv, { columns: true });

console.log(records);
// [
//   { id: '1', name: 'Alice', notes: '' },
//   { id: '2', name: 'Bob', notes: 'Completed onboarding' },
// ]
```

---

## Next Steps

Now that you can parse strings into rows and records, learn how to serialize data back into RFC 4180
CSV in [3. Stringifying & Formatting](./03-stringifying-and-formatting.md).
