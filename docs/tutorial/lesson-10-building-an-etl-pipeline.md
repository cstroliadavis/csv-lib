# Lesson 10: Building a Streaming ETL Pipeline

Congratulations on reaching the final lesson! In this capstone exercise, you will combine
`streamCsvFile`, `createCsvWriter`, and record transformation to build an end-to-end Extract,
Transform, Load (ETL) pipeline that runs in constant memory.

---

## The Scenario

Suppose you receive a raw sales export (`raw-sales.csv`) with messy whitespace, blank lines, and
cancelled orders. You want to:

1. **Extract**: Stream `raw-sales.csv` record-by-record with `trim: true` and
   `skipEmptyLines: true`.
2. **Transform**: Filter out `CANCELLED` orders and compute `totalCents` from `quantity * unitPrice`.
3. **Load**: Stream the cleaned records incrementally to `clean-sales.csv` using `createCsvWriter`.

---

## Step 1: Implement the Pipeline

Create `etl-pipeline.ts`:

```typescript
import { createCsvWriter, readCsvFile, streamCsvFile, writeCsvFile } from 'csv-lib';

interface RawSaleRecord {
  orderId: string;
  quantity: string;
  status: string;
  unitPrice: string;
}

// 1. Seed a sample raw CSV file
const rawContent = [
  ['orderId', 'status', 'quantity', 'unitPrice'],
  [' ORD-1 ', ' COMPLETED ', ' 2 ', ' 19.99 '],
  [' ORD-2 ', ' CANCELLED ', ' 1 ', ' 49.99 '],
  [' ORD-3 ', ' COMPLETED ', ' 5 ', ' 9.50 '],
];

await writeCsvFile('./raw-sales.csv', rawContent, { lineBreak: '\n' });

// 2. Open a streaming writer for the destination file
const writer = createCsvWriter('./clean-sales.csv', {
  columns: ['orderId', 'quantity', 'totalCents'],
  lineBreak: '\n',
});

// 3. Stream, filter, transform, and write one record at a time
const sourceStream = streamCsvFile<RawSaleRecord>('./raw-sales.csv', {
  columns: true,
  skipEmptyLines: true,
  trim: true,
});

for await (const sale of sourceStream) {
  if (sale.status !== 'COMPLETED') continue;

  const quantity = Number(sale.quantity);
  const unitPrice = Number(sale.unitPrice);
  const totalCents = Math.round(quantity * unitPrice * 100);

  await writer.writeRecord({
    orderId: sale.orderId,
    quantity,
    totalCents,
  });
}

// 4. Flush and close the writer sink
await writer.close();

// 5. Verify the output file
const cleanRecords = await readCsvFile('./clean-sales.csv', { columns: true });
console.log(cleanRecords);
// [
//   { orderId: 'ORD-1', quantity: '2', totalCents: '3998' },
//   { orderId: 'ORD-3', quantity: '5', totalCents: '4750' },
// ]
```

---

## Course Complete!

You have mastered the entire `csv-lib` toolkit:

- Synchronous parsing (`parseCsv`) and stateful push parsing (`createCsvParser`)
- Header discovery and typed record mapping (`columns: true | string[]`)
- Formatting arrays and records (`stringifyCsv`, `createCsvStringifier`)
- Async generators and Web `TransformStream` pipelines (`parseCsvStream`, `createCsvReader`,
  `createCsvTransformStream`, `createCsvFormatTransformStream`)
- High-speed `Bun.file` operations (`readCsvFile`, `streamCsvFile`, `writeCsvFile`, `appendCsvFile`,
  `createCsvWriter`)

---

- [⬅ Previous: Lesson 09 — Reading, Writing & Appending Files](./lesson-09-reading-and-writing-files.md)
- [Return to Developer Guide Index ➔](../README.md)

