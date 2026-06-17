// Formatting utilities for displaying on-chain values

export function truncateAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}…${address.slice(-4)}`;
}

export function microToStx(micro: number): string {
  return (micro / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function blocksToDays(blocks: number, secsPerBlock = 5): string {
  const seconds = blocks * secsPerBlock;
  const days = seconds / 86400;
  if (days < 1) return `${(seconds / 3600).toFixed(1)}h`;
  return `${days.toFixed(1)}d`;
}

export function stxToMicro(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

export function shortHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}
