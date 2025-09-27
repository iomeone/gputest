import { makeTuples } from '@use-gpu/core';
import { makeInlineCursor } from './cursor';

describe('layout cursor', () => {
  
  const lineHeight = 30;
  
  it('makes centered rows with hard breaks and multiple items', () => {
    
    const cursor = makeInlineCursor(0, 'center');
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 2, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, count, cross, _a, _d, _x, index) =>
      out.push([start, end, gap, lead, count, cross, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });

  it('makes centered rows with soft-wrapped breaks', () => {
    
    const cursor = makeInlineCursor(390, 'center');
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(300, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, count, cross, _a, _d, _x, index) =>
      out.push([start, end, gap, lead, count, cross, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });
  
  it('makes justified rows with soft-wrapped breaks', () => {
    
    const cursor = makeInlineCursor(390, 'justify');
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(300, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, count, cross, _a, _d, _x, index) =>
      out.push([start, end, gap, lead, count, cross, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });
  
  it('makes right-justified rows with soft-wrapped breaks', () => {
    
    const cursor = makeInlineCursor(390, 'justify-end');
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(200, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(300, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 0, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);
    cursor.push(100, 10, 1, lineHeight, 0, 0, 0);

    const out: number[][] = [];
    const blocks = cursor.gather((start, end, gap, lead, count, cross, _a, _d, _x, index) =>
      out.push([start, end, gap, lead, count, cross, index]));
    
    expect(out).toMatchSnapshot();
    expect(blocks).toMatchSnapshot();
  });
});
