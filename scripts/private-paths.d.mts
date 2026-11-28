export type PreservedFile = {
  source: string;
  destination: string;
  bytes: number;
};

export const BLOCKED_PUBLIC_PATHS: string[];
export const PRESERVED_DIR: string;

export function normalizeRelative(file: string): string;
export function isBlockedPublicPath(file: string): boolean;
export function findBlockedPaths(root: string, options?: { recursive?: boolean }): string[];
export function publicBlockedPaths(publicDir?: string): string[];
export function distBlockedPaths(distDir?: string): string[];
export function blockedSummary(paths: string[]): string;
export function preserveBlockedPublicData(options?: {
  publicDir?: string;
  preserveDir?: string;
  logger?: (message: string) => void;
}): PreservedFile[];
export function assertNoBlockedPublicData(publicDir?: string): void;
export function assertCleanDist(distDir?: string): void;
