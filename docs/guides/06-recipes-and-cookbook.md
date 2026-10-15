# 6. Recipes & Cookbook

This cookbook provides copy-pasteable patterns for common production scenarios with `csv-lib`.

---

## Recipe 1: Streaming ETL Pipeline (Filter, Enrich & Write)

Stream a huge source CSV file from disk, filter and enrich each record asynchronously, and stream
the output to a destination file with constant memory usage:

```typescript
import { streamCsvFile, writeCsvFile } from 'csv-lib';

interface InputOrder {
  amount: string;
  customerId: string;
  orderId: string;
  status: string;
}

async function* transformOrders(sourcePath: string) {
  const stream = streamCsvFile<InputOrder>(sourcePath, {
    columns: true,
    skipEmptyLines: true,
    trim: true,
  });

  for await (const order of stream) {
    if (order.status !== 'PAID') continue;

    const cents = Math.round(Number(order.amount) * 100);

    yield {
      AmountCents: cents,
      CustomerId: order.customerId,
      OrderId: order.orderId,
      ProcessedAt: new Date(),
    };
  }
}

await writeCsvFile('./settled-orders.csv', transformOrders('./raw-orders.csv'), {
  columns: ['OrderId', 'CustomerId', 'AmountCents', 'ProcessedAt'],
  lineBreak: '\n',
});
```

---

## Recipe 2: Streaming CSV Downloads in `Bun.serve()`

Use `stringifyCsvStream` and `toReadableStream` to stream database query results directly as an HTTP
CSV download response in `Bun.serve()`:

```typescript
import { stringifyCsvStream, toReadableStream } from 'csv-lib';

async function* streamUsersFromDb() {
  yield { email: 'alice@example.com', id: 1, role: 'admin' };
  yield { email: 'bob@example.com', id: 2, role: 'member' };
}

Bun.serve({
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/export/users.csv') {
      const csvLines = stringifyCsvStream(streamUsersFromDb());
      const body = toReadableStream(csvLines);

      return new Response(body, {
        headers: {
          'Content-Disposition': 'attachment; filename="users.csv"',
          'Content-Type': 'text/csv; charset=utf-8',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
  port: 3000,
});
```

---

## Recipe 3: Converting Regional Semicolon CSV to Standard UTF-8 CSV

Many European spreadsheet exports use `;` as the field delimiter because `,` is used as a decimal
separator. Convert them cleanly using `createCsvReader` and `createCsvFormatTransformStream`:

```typescript
import { createCsvFormatTransformStream, createCsvReader } from 'csv-lib';

const reader = createCsvReader(Bun.file('eu-export.csv').stream(), {
  columns: true,
  delimiter: ';',
  skipEmptyLines: true,
});

const standardCsvStream = reader.pipeThrough(
  createCsvFormatTransformStream({
    delimiter: ',',
    lineBreak: '\n',
  }),
);

await Bun.write('standard-export.csv', new Response(standardCsvStream));
```

---

## Recipe 4: Unit Testing CSV Components with Isolated Setup

When writing unit tests with `bun:test`, create an isolated `setup()` helper for parser or
stringifier instances:

```typescript
import { describe, expect, it } from 'bun:test';
import { createCsvParser, createCsvStringifier } from 'csv-lib';

describe('Order CSV Roundtrip', () => {
  const setup = () => {
    const parser = createCsvParser({ columns: true, trim: true });
    const stringifier = createCsvStringifier({
      columns: ['id', 'note'],
      lineBreak: '\n',
    });

    return Object.freeze({ parser, stringifier });
  };

  it('roundtrips records containing quotes and multiline text', () => {
    const { parser, stringifier } = setup();
    const original = [{ id: '101', note: 'Line 1\n"Quoted Line 2"' }];

    const csv = stringifier.stringifyRecords(original);
    const parsed = parser.parse(csv);

    expect(parsed).toEqual(original);
  });
});
```

---

## Next Steps

Want a guided, step-by-step learning path? Start the
[10-Lesson Hands-On Tutorial](../tutorial/README.md).

