import { esdt, esdt1d, resolveSDF } from './sdf-esdt';
import { makeSDFStage } from './sdf';

const INF = 1e10;

const fmt = (d: number[], w: number, h: number) => {
  const m: any[][] = [];
  for (let y = 0; y < h; y++) {
    const r: any[] = [];
    for (let x = 0; x < w; x++) {
      const v = +d[x + y * w];
      r.push(v > 1000 ? 'I' : v.toFixed(2));
    }
    m.push(r);
  }
  return m;
}

const sqr = (x: number) => x * x;

describe('edt', () => {
  it('edt1d pixel aligned', () => {
    
    const I = 1e10;
    const mask = [0, 0, 0, I, I, I, I, I, I, 0, 0, 0] as any;
    const xs   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const ys   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = mask.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(mask, xs, ys, offset, stride, length, f, z, b, t, v, 1);
    expect(xs).toEqual([0, 0, 0,-1,-2,-3, 3, 2, 1, 0, 0, 0])
  });

  it('edt1d fractional left', () => {
    
    const I = 1e10;
    const F = -0.25;
    const mask = [0, 0, 0, I, I, I, I, I, I, 0, 0, 0] as any;
    const xs   = [0, 0, F, 0, 0, 0, 0, 0, 0, F, 0, 0] as any;
    const ys   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = mask.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(mask, xs, ys, offset, stride, length, f, z, b, t, v, 1);
    
    expect(xs).toEqual([0, 0, F,-1+F,-2+F,-3+F,3+F,2+F,1+F, F, 0, 0])
  });

  it('edt1d signed pixel aligned', () => {
    
    const I = 1e10;
    const outer = [I, I, I,  0, 0, 0, 0, 0,  0, I, I, I] as any;
    const inner = [0, 0, 0,  0, I, I, I, I,  0, 0, 0, 0] as any;

    const P =  0.5;
    const N = -0.5;
    const xo    = [0, 0, 0, P, 0, 0, 0, 0, N, 0, 0, 0] as any;
    const yo    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const xi    = [0, 0, 0, N, 0, 0, 0, 0, P, 0, 0, 0] as any;
    const yi    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = outer.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(outer, xo, yo, offset, stride, length, f, z, b, t, v, 1);
    esdt1d(inner, xi, yi, offset, stride, length, f, z, b, t, v, -1);

    const ds = resolveSDF(xo, yo, xi, yi);
    expect(ds).toEqual([3, 2, 1, 0, -1, -2, -2, -1, 0, 1, 2, 3]);
  });

  it('edt1d signed fractional left-left', () => {
    
    const I = 1e10;
    const outer = [I, I, I, 0, 0, 0, 0, 0, 0, I, I, I] as any;
    const inner = [0, 0, 0, 0, I, I, I, I, 0, 0, 0, 0] as any;

    const F = -0.25;
    const P =  0.5 + F;
    const N = -0.5 + F;

    const xo    = [0, 0, 0, P, 0, 0, 0, 0, N, 0, 0, 0] as any;
    const yo    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const xi    = [0, 0, 0, N, 0, 0, 0, 0, P, 0, 0, 0] as any;
    const yi    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = outer.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(outer, xo, yo, offset, stride, length, f, z, b, t, v, 1);
    esdt1d(inner, xi, yi, offset, stride, length, f, z, b, t, v, -1);

    const ds = resolveSDF(xo, yo, xi, yi);
    expect(ds).toEqual([3-P, 2-P, 1-P, -P, -1-P, -2-P, -2+P, -1+P, +P, 1+P, 2+P, 3+P]);
  });

  it('edt1d signed fractional right-right', () => {
    
    const I = 1e10;
    const outer = [I, I, I, 0, 0, 0, 0, 0, 0, I, I, I] as any;
    const inner = [0, 0, 0, 0, I, I, I, I, 0, 0, 0, 0] as any;

    const F =  0.25;
    const P =  0.5 + F;
    const N = -0.5 + F;

    const xo    = [0, 0, 0, P, 0, 0, 0, 0, N, 0, 0, 0] as any;
    const yo    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const xi    = [0, 0, 0, N, 0, 0, 0, 0, P, 0, 0, 0] as any;
    const yi    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = outer.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(outer, xo, yo, offset, stride, length, f, z, b, t, v, 1);
    esdt1d(inner, xi, yi, offset, stride, length, f, z, b, t, v, -1);

    const ds = resolveSDF(xo, yo, xi, yi);
    expect(ds).toEqual([3-N, 2-N, 1-N, -N, -1-N, -2-N, -2+N, -1+N, +N, 1+N, 2+N, 3+N]);
  });

  it('edt1d signed fractional left-right', () => {
    
    const I = 1e10;
    const outer = [I, I, I, 0, 0, 0, 0, 0, 0, I, I, I] as any;
    const inner = [0, 0, 0, 0, I, I, I, I, 0, 0, 0, 0] as any;

    const F =  0.25;
    const PL =  0.5 - F;
    const NL = -0.5 - F;
    const PR =  0.5 + F;
    const NR = -0.5 + F;

    const xo    = [0, 0, 0,PL, 0, 0, 0, 0,NR, 0, 0, 0] as any;
    const yo    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const xi    = [0, 0, 0,NL, 0, 0, 0, 0,PR, 0, 0, 0] as any;
    const yi    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = outer.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(outer, xo, yo, offset, stride, length, f, z, b, t, v, 1);
    esdt1d(inner, xi, yi, offset, stride, length, f, z, b, t, v, -1);

    const ds = resolveSDF(xo, yo, xi, yi);
    expect(ds).toEqual([3-PL, 2-PL, 1-PL, -PL, -1-PL, -2-PL, -2+NR, -1+NR, +NR, 1+NR, 2+NR, 3+NR]);
  });

  it('edt1d signed fractional right-left', () => {
    
    const I = 1e10;
    const outer = [I, I, I, 0, 0, 0, 0, 0, 0, I, I, I] as any;
    const inner = [0, 0, 0, 0, I, I, I, I, 0, 0, 0, 0] as any;

    const F =  -0.25;
    const PL =  0.5 - F;
    const NL = -0.5 - F;
    const PR =  0.5 + F;
    const NR = -0.5 + F;

    const xo    = [0, 0, 0,PL, 0, 0, 0, 0,NR, 0, 0, 0] as any;
    const yo    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const xi    = [0, 0, 0,NL, 0, 0, 0, 0,PR, 0, 0, 0] as any;
    const yi    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = outer.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(outer, xo, yo, offset, stride, length, f, z, b, t, v, 1);
    esdt1d(inner, xi, yi, offset, stride, length, f, z, b, t, v, -1);

    const ds = resolveSDF(xo, yo, xi, yi);
    expect(ds).toEqual([3-NL, 2-NL, 1-NL, -NL, -1-NL, -2-NL, -2+PR, -1+PR, +PR, 1+PR, 2+PR, 3+PR]);
  });

  it('edt2d transverse pixel aligned', () => {
    
    const I = 1e10;
    const mask = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const xs   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as any;
    const ys   = [0, 0, 0,-1.1,-2,-2,-2,-2,-1.1, 0, 0, 0] as any;

    const offset = 0;
    const stride = 1;
    const length = mask.length;
    
    const f = [] as any;
    const z = [] as any;
    const b = [] as any;
    const t = [] as any;
    const v = [] as any;
    
    esdt1d(mask, xs, ys, offset, stride, length, f, z, b, t, v, 1);
    
    expect(xs).toEqual([0, 0, 0,-1,  -1, 0, 0,   1, 1, 0, 0, 0])
    expect(ys).toEqual([0, 0, 0, 0,-1.1,-2,-2,-1.1, 0, 0, 0, 0])
  });
});
