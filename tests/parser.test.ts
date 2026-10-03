import { describe, expect, it } from 'bun:test';
import { createCsvParser, parseCsv, parseCsvStream } from '../src/parser.ts';

describe('CSV Parser', () => {
  const setup = () => {
    const parser = createCsvParser();

    return Object.freeze({
      parser,
    });
  };

  it('parses simple comma-separated values', () => {
    const { parser } = setup();
    const rows = parser.parse('name,age,city\nAlice,30,New York\nBob,25,Chicago');

    expect(rows).toEqual([
      ['name', 'age', 'city'],
      ['Alice', '30', 'New York'],
      ['Bob', '25', 'Chicago'],
    ]);
  });

  it('handles embedded double quotes correctly', () => {
    const csv =
      'quote,text\n"simple","He said ""Hello!"" to everyone"\n"extra","Double """" quotes"';
    const rows = parseCsv(csv);

    expect(rows).toEqual([
      ['quote', 'text'],
      ['simple', 'He said "Hello!" to everyone'],
      ['extra', 'Double "" quotes'],
    ]);
  });

  it('parses multiline cells with embedded newlines', () => {
    const csv = 'id,description\n1,"Line 1\nLine 2\nLine 3"\n2,"CRLF \r\n multiple \r\n lines"';
    const rows = parseCsv(csv);

    expect(rows).toEqual([
      ['id', 'description'],
      ['1', 'Line 1\nLine 2\nLine 3'],
      ['2', 'CRLF \r\n multiple \r\n lines'],
    ]);
  });

  it('handles empty fields and empty quoted cells', () => {
    const csv = 'a,,c\n"","value",\n,,';
    const rows = parseCsv(csv);

    expect(rows).toEqual([
      ['a', '', 'c'],
      ['', 'value', ''],
      ['', '', ''],
    ]);
  });

  it('parses records into objects when columns is true', () => {
    const csv = 'name,age,active\nAlice,30,true\nBob,25,false';
    const records = parseCsv(csv, { columns: true });

    expect(records).toEqual([
      { active: 'true', age: '30', name: 'Alice' },
      { active: 'false', age: '25', name: 'Bob' },
    ]);
  });

  it('maps rows to explicitly provided column names', () => {
    const csv = 'Alice,30\nBob,25';
    const records = parseCsv(csv, { columns: ['userName', 'userAge'] });

    expect(records).toEqual([
      { userAge: '30', userName: 'Alice' },
      { userAge: '25', userName: 'Bob' },
    ]);
  });

  it('supports custom delimiter such as semicolon or tab', () => {
    const csv = 'col1;col2;col3\r\nval1;"val;2";val3';
    const rows = parseCsv(csv, { delimiter: ';' });

    expect(rows).toEqual([
      ['col1', 'col2', 'col3'],
      ['val1', 'val;2', 'val3'],
    ]);
  });

  it('trims whitespace when trim option is enabled', () => {
    const csv = '  col1 , " col2 " , col3  \n  val1 ,  "val2"  , val3 ';
    const rows = parseCsv(csv, { trim: true });

    expect(rows).toEqual([
      ['col1', ' col2 ', 'col3'],
      ['val1', 'val2', 'val3'],
    ]);
  });

  it('skips empty lines when skipEmptyLines is true', () => {
    const csv = 'a,b\n\n\nc,d\n';
    const rows = parseCsv(csv, { skipEmptyLines: true });

    expect(rows).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('strips UTF-8 Byte Order Mark (BOM)', () => {
    const csvWithBom = '\uFEFFname,score\nAlice,100';
    const rows = parseCsv(csvWithBom);

    expect(rows).toEqual([
      ['name', 'score'],
      ['Alice', '100'],
    ]);
  });

  it('streams parsed rows as chunks arrive', async () => {
    async function* chunkGenerator() {
      yield 'id,name\n';
      yield '1,"Al';
      yield 'ice"\n2,';
      yield 'Bob\n';
    }

    const collected: (string[] | Record<string, string>)[] = [];

    for await (const row of parseCsvStream(chunkGenerator())) {
      collected.push(row);
    }

    expect(collected).toEqual([
      ['id', 'name'],
      ['1', 'Alice'],
      ['2', 'Bob'],
    ]);
  });
});
