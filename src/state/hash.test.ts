import { getHash } from './hash';

describe('hash', () => {

  it('hashes values', () => {
    expect(getHash(undefined)).toEqual('1l2iguh1n2');
    expect(getHash(null)).toEqual('8vth8a6rwg');
    expect(getHash("")).toEqual('uottwj0y3r');
    expect(getHash("0")).toEqual('38065vocck');
    expect(getHash(0)).toEqual('91bv1y81jg');
    expect(getHash(1)).toEqual('28jo6jjg7z');
    expect(getHash(0x100000000)).toEqual('3l8z18qqcf');
    expect(getHash(0x100000001)).toEqual('bjtjon1r4w');
    expect(getHash([])).toEqual('pcbqk3lwbn');
    expect(getHash([0])).toEqual('yz8mf8hmv4');
    expect(getHash([1])).toEqual('tpn113u1p3');
    expect(getHash({})).toEqual('9q11f1m8s9');
    expect(getHash({f:0})).toEqual('1bru16c4iq');
    expect(getHash({g:0})).toEqual('cd3z2uv6ae');
    expect(getHash({f:1})).toEqual('xd2698tw35');
    expect(getHash({g:1})).toEqual('t80dt2qiwp');

    const u8 = new Uint8Array(3);
    u8[0] = 1;
    u8[1] = 2;

    expect(getHash(u8)).toEqual('zoy66fqire');

    u8[2] = 2;

    expect(getHash(u8)).toEqual('9j8jh6vgmv');
  });
  
});