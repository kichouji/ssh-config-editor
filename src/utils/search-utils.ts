import { SSHHostEntry } from '../types/ssh-config';

/**
 * Search hosts by keyword
 * Searches in host pattern, tag, and all property values
 */
export function searchHosts(
  hosts: SSHHostEntry[],
  searchQuery: string
): SSHHostEntry[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return hosts;
  }

  const keywords = searchQuery.toLowerCase().trim().split(/\s+/);

  return hosts.filter((host) =>
    keywords.every((keyword) => matchesKeyword(host, keyword))
  );
}

/**
 * Check if a host matches a search keyword
 */
function matchesKeyword(host: SSHHostEntry, keyword: string): boolean {
  // Search in host pattern
  if (host.host.toLowerCase().includes(keyword)) {
    return true;
  }

  // Search in tag
  if (host.tag && host.tag.toLowerCase().includes(keyword)) {
    return true;
  }

  // Search in properties
  return host.properties.some(
    (prop) =>
      prop.key.toLowerCase().includes(keyword) ||
      prop.value.toLowerCase().includes(keyword)
  );
}

/**
 * Highlight search keywords in text
 */
export function highlightSearchText(
  text: string,
  searchQuery: string
): { text: string; isHighlight: boolean }[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return [{ text, isHighlight: false }];
  }

  const keywords = searchQuery.toLowerCase().trim().split(/\s+/);
  const pattern = keywords.map((k) => escapeRegExp(k)).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    isHighlight: keywords.some((k) => part.toLowerCase() === k),
  }));
}

/**
 * Escape special characters for RegExp
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
