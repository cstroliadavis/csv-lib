import { describe, expect, it } from 'bun:test';
import { createCsvStringifier, stringifyCsv, stringifyCsvStream } from '../src/stringifier.ts';

describe('CSV Stringifier', () => {
  const setup = () => {
    const stringifier = createCsvStringifier({ lineBreak: '\n' });

    return Object.freeze({
      stringifier,
    });
  };

  it('stringifies simple rows with default comma delimiter and CRLF', () => {
    const rows = [
      ['name', 'age'],
      ['Alice', '30'],
      ['Bob', '25'],
    ];
    const csv = stringifyCsv(rows);

    expect(csv).toBe('name,age\r\nAlice,30\r\nBob,25\r\n');
  });

  it('escapes embedded double quotes by doubling them', () => {
    const rows = [
      ['quote', 'author'],
      ['He said "Hello"', 'Mark'],
      ['A "quoted" word', 'Jane'],
    ];
    const csv = stringifyCsv(rows, { lineBreak: '\n' });

    expect(csv).toBe('quote,author\n"He said ""Hello""",Mark\n"A ""quoted"" word",Jane\n');
  });

  it('quotes cells containing newlines or commas', () => {
    const rows = [
      ['id', 'text'],
      [1, 'line 1\nline 2'],
      [2, 'hello, world'],
    ];
    const csv = stringifyCsv(rows, { lineBreak: '\n' });

    expect(csv).toBe('id,text\n1,"line 1\nline 2"\n2,"hello, world"\n');
  });

  it('formats various data types such as numbers, booleans, and nulls', () => {
    const rows = [
      ['name', 'score', 'active', 'notes'],
      ['Alice', 99.5, true, null],
      ['Bob', 0, false, undefined],
    ];
    const csv = stringifyCsv(rows, { lineBreak: '\n' });

    expect(csv).toBe('name,score,active,notes\nAlice,99.5,true,\nBob,0,false,\n');
  });

  it('stringifies record objects with an automatic header row', () => {
    const records = [
      { age: 30, name: 'Alice' },
      { age: 25, name: 'Bob' },
    ];
    const csv = stringifyCsv(records, { lineBreak: '\n' });

    expect(csv).toBe('age,name\n30,Alice\n25,Bob\n');
  });

  it('respects custom column order when specified for records', () => {
    const records = [
      { age: 30, name: 'Alice' },
      { age: 25, name: 'Bob' },
    ];
    const csv = stringifyCsv(records, {
      columns: ['name', 'age'],
      lineBreak: '\n',
    });

    expect(csv).toBe('name,age\nAlice,30\nBob,25\n');
  });

  it('quotes all fields when quoted option is enabled', () => {
    setup();
    const forcedQuoting = createCsvStringifier({ lineBreak: '\n', quoted: true });
    const csv = forcedQuoting.stringifyRows([
      ['Alice', '30'],
      ['Bob', '25'],
    ]);

    expect(csv).toBe('"Alice","30"\n"Bob","25"\n');
  });

  it('streams formatted CSV lines asynchronously', async () => {
    async function* generateRows() {
      yield ['id', 'label'];
      yield [1, 'item A'];
      yield [2, 'item B'];
    }

    const lines: string[] = [];

    for await (const line of stringifyCsvStream(generateRows(), { lineBreak: '\n' })) {
      lines.push(line);
    }

    expect(lines).toEqual(['id,label\n', '1,item A\n', '2,item B\n']);
  });
});
