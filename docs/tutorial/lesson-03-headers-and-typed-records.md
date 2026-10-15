# Lesson 03: Headers & Typed Records

Accessing cells by numeric index (`row[0]`, `row[1]`) can become brittle when columns are reordered.
In this lesson, you will map rows directly into typed key-value objects using the `columns` option.

---

## Step 1: Using the First Row as Headers (`columns: true`)

Pass `{ columns: true }` to use the first row of the CSV as object keys:

```typescript
import { parseCsv } from 'csv-lib';

const csv = ['name,age,active', 'Alice,30,true', 'Bob,25,false'].join('\n');

const records = parseCsv(csv, { columns: true });

console.log(records);
// [
//   { active: 'true', age: '30', name: 'Alice' },
//   { active: 'false', age: '25', name: 'Bob' },
// ]
```

---

## Step 2: Providing Custom Column Names (`columns: string[]`)

When parsing a file that does not have a header row, pass an array of column names to `columns`:

```typescript
import { parseCsv } from 'csv-lib';

const raw = 'Alice,30\nBob,25';
const records = parseCsv(raw, {
  columns: ['userName', 'userAge'],
});

console.log(records);
// [
//   { userAge: '30', userName: 'Alice' },
//   { userAge: '25', userName: 'Bob' },
// ]
```

---

## Step 3: Adding TypeScript Type Safety

Supply a type parameter `parseCsv<T>(...)` so TypeScript knows the exact properties of each record:

```typescript
import { parseCsv } from 'csv-lib';

interface UserCsvRecord {
  active: string;
  age: string;
  name: string;
}

const users = parseCsv<UserCsvRecord>('name,age,active\nAlice,30,true', {
  columns: true,
});

for (const user of users) {
  console.log(`${user.name} is ${user.age} years old.`);
}
```

---

## Summary

- `{ columns: true }` consumes the first row as column headers and emits `Record<string, string>`
  objects for all subsequent rows.
- `{ columns: ['colA', 'colB'] }` maps every row (including the first) to the specified keys.
- Pass a generic type parameter (`parseCsv<MyRecord>`) for compile-time autocomplete and type
  checking.

---

- [⬅ Previous: Lesson 02 — Delimiters, Quotes & Multiline Cells](./lesson-02-delimiters-quotes-and-multiline.md)
- [Next: Lesson 04 — Cleaning Messy Input ➔](./lesson-04-cleaning-messy-input.md)
