import { makeTuples } from '@use-gpu/core';
import { makeLayoutCursor } from './cursor';

describe('layout cursor', () => {
  
  const lineHeight = 30;
  
  it('makes centered rows with hard breaks and multiple items', () => {
    
    const cursor = makeLayoutCursor(0, 'center');
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 2, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 1, lineHeight);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, index) => out.push([start, end, gap, lead, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });

  it('makes centered rows with soft-wrapped breaks', () => {
    
    const cursor = makeLayoutCursor(390, 'center');
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(300, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 1, lineHeight);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, index) => out.push([start, end, gap, lead, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });
  
  it('makes justified rows with soft-wrapped breaks', () => {
    
    const cursor = makeLayoutCursor(390, 'justify');
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(300, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 1, lineHeight);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, index) => out.push([start, end, gap, lead, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });
  
  it('makes right-justified rows with soft-wrapped breaks', () => {
    
    const cursor = makeLayoutCursor(390, 'justify-end');
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(200, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(300, 10, 0, lineHeight);
    cursor.push(100, 10, 0, lineHeight);
    cursor.push(100, 10, 1, lineHeight);
    cursor.push(100, 10, 1, lineHeight);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, index) => out.push([start, end, gap, lead, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });
});
