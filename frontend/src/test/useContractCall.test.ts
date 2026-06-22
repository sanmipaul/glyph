import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContractCall } from '@/hooks/useContractCall';

vi.mock('@stacks/connect', () => ({
  openContractCall: vi.fn(),
}));

import { openContractCall } from '@stacks/connect';

describe('useContractCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useContractCall());
    expect(result.current.status).toBe('idle');
    expect(result.current.txid).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets status to signing when call is initiated', async () => {
    (openContractCall as any).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useContractCall());
    act(() => {
      result.current.call({
        contractName: 'test-contract',
        functionName: 'test-fn',
        functionArgs: [],
      });
    });

    expect(result.current.status).toBe('signing');
  });

  it('resets to idle state after reset()', async () => {
    (openContractCall as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useContractCall());
    act(() => { result.current.call({ contractName: 'c', functionName: 'f', functionArgs: [] }); });
    act(() => { result.current.reset(); });

    expect(result.current.status).toBe('idle');
    expect(result.current.txid).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
