/**
 * Normalizes a path by removing trailing slashes
 * @param path The path to normalize
 * @returns The normalized path
 */
export const normalizePath = (path: string): string => path.replace(/\/+$/, '');
