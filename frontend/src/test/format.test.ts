import { describe, it, expect } from 'vitest';
import { truncateAddress, microToStx, bpsToPercent, blocksToDays, stxToMicro, shortHash } from '@/lib/format';

describe('truncateAddress', () => {
  it('shortens a long address', () => {
    const addr = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ';
    const result = truncateAddress(addr);
    expect(result).toContain('…');
    expect(result.length).toBeLessThan(addr.length);
  });

  it('uses custom char count', () => {
    const addr = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ';
    const result = truncateAddress(addr, 4);
    expect(result.startsWith('SP2J')).toBe(true);
  });
});

describe('microToStx', () => {
  it('converts 1_000_000 micro to 1.00 STX', () => {
    expect(microToStx(1_000_000)).toBe('1.00');
  });

  it('converts 500_000 micro to 0.50 STX', () => {
    expect(microToStx(500_000)).toContain('0.5');
  });
});

describe('bpsToPercent', () => {
  it('converts 5000 bps to 50.00%', () => {
    expect(bpsToPercent(5000)).toBe('50.00%');
  });

  it('converts 100 bps to 1.00%', () => {
    expect(bpsToPercent(100)).toBe('1.00%');
  });
});

describe('blocksToDays', () => {
  it('returns hours for less than 1 day', () => {
    expect(blocksToDays(1000)).toContain('h');
  });

  it('returns days for large block counts', () => {
    expect(blocksToDays(100_000)).toContain('d');
  });
});

describe('stxToMicro', () => {
  it('converts 1 STX to 1_000_000 micro', () => {
    expect(stxToMicro(1)).toBe(1_000_000);
  });

  it('floors fractional results', () => {
    expect(stxToMicro(0.0000001)).toBe(0);
  });
});

describe('shortHash', () => {
  it('truncates long hashes', () => {
    const hash = 'abc123def456ghi789jkl012mno345pqr678stu901';
    const result = shortHash(hash);
    expect(result).toContain('…');
    expect(result.length).toBeLessThan(hash.length);
  });

  it('leaves short hashes unchanged', () => {
    const hash = 'abc123';
    expect(shortHash(hash)).toBe(hash);
  });
});
