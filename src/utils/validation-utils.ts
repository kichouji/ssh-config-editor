import { SSHProperty } from '../types/ssh-config';
import { extractLocalForwardPort } from '../constants/ssh-properties';

/**
 * Detect duplicate local ports in LocalForward entries
 *
 * @param properties - Array of SSH properties to validate
 * @returns Set of indices where duplicate ports are found (only for enabled entries)
 *
 * @example
 * const properties = [
 *   { key: 'LocalForward', value: '8080 localhost:80', enabled: true },
 *   { key: 'LocalForward', value: '8080 example.com:443', enabled: true },
 *   { key: 'HostName', value: '192.168.1.1', enabled: true }
 * ];
 * const duplicates = detectDuplicateLocalForwardPorts(properties);
 * // Returns Set { 0, 1 } - indices 0 and 1 have duplicate port 8080
 */
export function detectDuplicateLocalForwardPorts(properties: SSHProperty[]): Set<number> {
  const duplicates = new Set<number>();
  const portToIndices = new Map<string, number[]>();

  // Collect all LocalForward entries with their ports (only enabled entries)
  properties.forEach((prop, index) => {
    if (prop.key === 'LocalForward' && prop.enabled) {
      const port = extractLocalForwardPort(prop.value);
      if (port) {
        if (!portToIndices.has(port)) {
          portToIndices.set(port, []);
        }
        portToIndices.get(port)!.push(index);
      }
    }
  });

  // Mark indices with duplicate ports
  portToIndices.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach(index => duplicates.add(index));
    }
  });

  return duplicates;
}
