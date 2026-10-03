import { describe, expect, it } from 'bun:test';
import {
  createCsvFormatTransformStream,
  createCsvReader,
  createCsvTransformStream,
  createCsvWriter,
  toReadableStream,
} from '../src/stream.ts';

describe('CSV Streams', () => {
  const setup = () => {
    const encoder = new TextEncoder();

    return Object.freeze({
      encoder,
    });
  };

  it('transforms text chunks through createCsvTransformStream', async () => {
    async function* chunks() {
      yield 'name,role\n';
      yield 'Alice,Engi';
      yield 'neer\nBob,Design';
      yield 'er\n';
    }

    const transformStream = createCsvTransformStream({ columns: true });
    const stream = toReadableStream(chunks()).pipeThrough(transformStream);
    const results: Record<string, string>[] = [];

    for await (const row of stream) {
      results.push(row as Record<string, string>);
    }

    expect(results).toEqual([
      { name: 'Alice', role: 'Engineer' },
      { name: 'Bob', role: 'Designer' },
    ]);
  });

  it('transforms Uint8Array chunks into parsed rows', async () => {
    const { encoder } = setup();

    async function* chunks() {
      yield encoder.encode('a,b,c\n');
      yield encoder.encode('1,"quoted\nnewline",3\n');
    }

    const transformStream = createCsvTransformStream();
    const stream = toReadableStream(chunks()).pipeThrough(transformStream);
    const results: string[][] = [];

    for await (const row of stream) {
      results.push(row as string[]);
    }

    expect(results).toEqual([
      ['a', 'b', 'c'],
      ['1', 'quoted\nnewline', '3'],
    ]);
  });

  it('transforms data items into CSV text through createCsvFormatTransformStream', async () => {
    async function* items() {
      yield ['id', 'title'];
      yield [101, 'CSV in Bun'];
    }

    const transformStream = createCsvFormatTransformStream({ lineBreak: '\n' });
    const stream = toReadableStream(items()).pipeThrough(transformStream);
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['id,title\n', '101,CSV in Bun\n']);
  });

  it('reads rows via createCsvReader async iteration and toArray', async () => {
    async function* makeChunks() {
      yield 'country,code\n';
      yield 'Japan,JP\n';
      yield 'Canada,CA\n';
    }

    const reader = createCsvReader(makeChunks(), { columns: true });
    const rows = await reader.toArray();

    expect(rows).toEqual([
      { code: 'JP', country: 'Japan' },
      { code: 'CA', country: 'Canada' },
    ]);
  });

  it('writes rows and records into a WritableStream with createCsvWriter', async () => {
    const chunks: string[] = [];
    const writable = new WritableStream<string>({
      write(chunk) {
        chunks.push(chunk);
      },
    });

    const writer = createCsvWriter(writable, {
      columns: ['name', 'score'],
      header: false,
      lineBreak: '\n',
    });

    await writer.writeRow(['name', 'score']);
    await writer.writeRecord({ name: 'Grace', score: 98 });
    await writer.close();

    expect(chunks).toEqual(['name,score\n', 'Grace,98\n']);
  });
});
