import { describe, expect, it } from 'bun:test';
import { parseCsv, parseCsvStream } from '../src/parser.ts';
import { stringifyCsv } from '../src/stringifier.ts';

describe('CSV Edge Cases and Stress Tests', () => {
  const setup = () => {
    const encoder = new TextEncoder();

    return Object.freeze({
      encoder,
    });
  };

  it('correctly handles 1-byte streaming chunks across quotes and multi-byte UTF-8', async () => {
    const { encoder } = setup();
    const rawCsv =
      [
        'id,quote,multiline,emoji',
        '1,"He said ""Hello, world!""","Line 1\r\nLine 2\r\nLine 3","🌟 Sparkle 🌟"',
        '2,"Another ""escaped"" quote","Multi\nline","café & 日本語"',
      ].join('\r\n') + '\r\n';

    const fullBytes = encoder.encode(rawCsv);

    async function* byteByByteGenerator() {
      for (let i = 0; i < fullBytes.length; i++) {
        yield fullBytes.subarray(i, i + 1);
      }
    }

    const streamedRows: string[][] = [];

    for await (const row of parseCsvStream(byteByByteGenerator())) {
      streamedRows.push(row as string[]);
    }

    const expectedRows = parseCsv<string[]>(rawCsv);

    expect(streamedRows).toEqual(expectedRows);
    expect(streamedRows.length).toBe(3);
    expect(streamedRows[1]?.[1]).toBe('He said "Hello, world!"');
    expect(streamedRows[1]?.[2]).toBe('Line 1\r\nLine 2\r\nLine 3');
    expect(streamedRows[1]?.[3]).toBe('🌟 Sparkle 🌟');
    expect(streamedRows[2]?.[3]).toBe('café & 日本語');
  });

  it('handles CRLF split across chunk boundaries', async () => {
    async function* splitCrlfChunks() {
      yield 'a,b\r';
      yield '\nc,d';
    }

    const rows: string[][] = [];

    for await (const row of parseCsvStream(splitCrlfChunks())) {
      rows.push(row as string[]);
    }

    expect(rows).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('handles escaped quote split across chunk boundaries', async () => {
    async function* splitQuoteChunks() {
      yield 'col1,col2\n"split "';
      yield '"quotes",val2\n';
    }

    const rows: string[][] = [];

    for await (const row of parseCsvStream(splitQuoteChunks())) {
      rows.push(row as string[]);
    }

    expect(rows).toEqual([
      ['col1', 'col2'],
      ['split "quotes', 'val2'],
    ]);
  });

  it('preserves empty rows and columns according to RFC 4180 rules', () => {
    const csv = 'a,b,\n,,\n"","",""\n';
    const rows = parseCsv(csv);

    expect(rows).toEqual([
      ['a', 'b', ''],
      ['', '', ''],
      ['', '', ''],
    ]);
  });

  it('successfully roundtrips complex rows through stringify and parse', () => {
    const original = [
      ['Title', 'Quote', 'Multiline', 'Special'],
      ['Row 1', 'He said "Yes!"', 'Alpha\nBeta\nGamma', 'comma, separated, list'],
      ['Row 2', 'Single " quote', 'CRLF\r\nline', 'normal'],
      ['Row 3', '""triple""', '', '   spaces   '],
    ];

    const serialized = stringifyCsv(original);
    const parsed = parseCsv(serialized);

    expect(parsed).toEqual(original);
  });
});
