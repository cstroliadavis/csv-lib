import { afterEach, describe, expect, it } from 'bun:test';
import { unlink } from 'node:fs/promises';
import { appendCsvFile, readCsvFile, streamCsvFile, writeCsvFile } from '../src/file.ts';
import type { CsvValue } from '../src/types.ts';

describe('CSV File Operations', () => {
  const tempFiles: string[] = [];

  const setup = () => {
    const tempPath = `temp_test_${Date.now()}_${Math.random().toString(36).slice(2)}.csv`;

    tempFiles.push(tempPath);

    return Object.freeze({
      tempPath,
    });
  };

  afterEach(async () => {
    while (tempFiles.length > 0) {
      const file = tempFiles.pop();

      if (!file) continue;

      try {
        await unlink(file);
      } catch {
        // Ignore file cleanup errors if file was not created
      }
    }
  });

  it('writes and reads an array of rows to and from a file', async () => {
    const { tempPath } = setup();
    const rows = [
      ['id', 'name', 'city'],
      ['1', 'Alice', 'New York'],
      ['2', 'Bob', 'San Francisco'],
    ];

    await writeCsvFile(tempPath, rows, { lineBreak: '\n' });
    const readBack = await readCsvFile(tempPath);

    expect(readBack).toEqual(rows);
  });

  it('writes and reads record objects with headers', async () => {
    const { tempPath } = setup();
    const records = [
      { age: '30', name: 'Alice' },
      { age: '25', name: 'Bob' },
    ];

    await writeCsvFile(tempPath, records, { lineBreak: '\n' });
    const readBack = await readCsvFile(tempPath, { columns: true });

    expect(readBack).toEqual(records);
  });

  it('streams file reading chunk-by-chunk using streamCsvFile', async () => {
    const { tempPath } = setup();
    const data = [
      ['header1', 'header2'],
      ['multiline\ncell', 'regular'],
      ['"embedded quotes"', 'simple'],
    ];

    await writeCsvFile(tempPath, data, { lineBreak: '\n' });

    const collected: string[][] = [];

    for await (const row of streamCsvFile(tempPath)) {
      collected.push(row as string[]);
    }

    expect(collected).toEqual(data);
  });

  it('streams async generator data into writeCsvFile', async () => {
    const { tempPath } = setup();

    async function* generateData(): AsyncGenerator<CsvValue[]> {
      yield ['dept', 'count'];
      yield ['Engineering', 42];
      yield ['Design', 12];
    }

    await writeCsvFile(tempPath, generateData(), { lineBreak: '\n' });
    const readBack = await readCsvFile(tempPath);

    expect(readBack).toEqual([
      ['dept', 'count'],
      ['Engineering', '42'],
      ['Design', '12'],
    ]);
  });

  it('appends records to an existing file without repeating headers', async () => {
    const { tempPath } = setup();
    const initialRecords = [{ city: 'Tokyo', country: 'Japan' }];

    await writeCsvFile(tempPath, initialRecords, { lineBreak: '\n' });

    const additionalRecords = [{ city: 'Paris', country: 'France' }];

    await appendCsvFile(tempPath, additionalRecords, { lineBreak: '\n' });
    const readBack = await readCsvFile(tempPath, { columns: true });

    expect(readBack).toEqual([
      { city: 'Tokyo', country: 'Japan' },
      { city: 'Paris', country: 'France' },
    ]);
  });
});
