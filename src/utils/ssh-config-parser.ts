import { SSHHostEntry, SSHProperty, SSHHostGroup, SSHConfigData } from '../types/ssh-config';

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Parse SSH config file content
export function parseSSHConfig(content: string): SSHConfigData {
  const lines = content.split(/\r?\n/);
  const groups: SSHHostGroup[] = [];
  const ungroupedHosts: SSHHostEntry[] = [];

  let currentGroup: SSHHostGroup | null = null;
  let currentHost: SSHHostEntry | null = null;
  let currentTag: string | null = null;
  let lineIndex = 0;
  let order = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines
    if (trimmedLine === '') {
      continue;
    }

    // Check for group marker (#$)
    if (trimmedLine.startsWith('#$')) {
      // Save current host if exists
      if (currentHost) {
        if (currentGroup) {
          currentGroup.hosts.push(currentHost);
        } else {
          ungroupedHosts.push(currentHost);
        }
        currentHost = null;
      }

      // Create new group
      const groupName = trimmedLine.substring(2).trim();
      currentGroup = {
        id: generateId(),
        name: groupName || 'Unnamed Group',
        hosts: [],
        order: order++,
      };
      groups.push(currentGroup);
      continue;
    }

    // Check for comment (potential tag or disabled property)
    if (trimmedLine.startsWith('#')) {
      // Check if next line is a Host directive
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';

      // Check if it's a commented-out Host
      const commentedHostMatch = trimmedLine.match(/^#\s*Host\s+(.+)$/i);
      if (commentedHostMatch) {
        // Save current host if exists
        if (currentHost) {
          if (currentGroup) {
            currentGroup.hosts.push(currentHost);
          } else {
            ungroupedHosts.push(currentHost);
          }
        }

        // Create new disabled host
        const hostPattern = commentedHostMatch[1].trim();
        currentHost = {
          id: generateId(),
          host: hostPattern,
          tag: currentTag || hostPattern,
          enabled: false,
          properties: [],
          order: order++,
        };
        currentTag = null;
        continue;
      }

      // Check for commented property (for disabled hosts)
      if (currentHost && !currentHost.enabled) {
        // Match commented property: #     PropertyKey value
        const commentedPropertyMatch = trimmedLine.match(/^#\s+([A-Za-z][A-Za-z0-9]*)\s+(.+)$/);
        if (commentedPropertyMatch) {
          const key = commentedPropertyMatch[1];
          const value = commentedPropertyMatch[2].trim();

          currentHost.properties.push({
            key,
            value,
            enabled: false,
          });
          continue;
        }
      }

      // If next line is Host, this is a tag
      if (nextLine.match(/^Host\s+/i)) {
        currentTag = trimmedLine.substring(1).trim();
      }
      continue;
    }

    // Check for Host directive
    const hostMatch = trimmedLine.match(/^Host\s+(.+)$/i);
    if (hostMatch) {
      // Save current host if exists
      if (currentHost) {
        if (currentGroup) {
          currentGroup.hosts.push(currentHost);
        } else {
          ungroupedHosts.push(currentHost);
        }
      }

      // Create new host
      const hostPattern = hostMatch[1].trim();
      currentHost = {
        id: generateId(),
        host: hostPattern,
        tag: currentTag || hostPattern,
        enabled: true,
        properties: [],
        order: order++,
      };
      currentTag = null;
      continue;
    }

    // Check for property
    if (currentHost) {
      const propertyMatch = trimmedLine.match(/^([A-Za-z][A-Za-z0-9]*)\s+(.+)$/);
      if (propertyMatch) {
        const key = propertyMatch[1];
        const value = propertyMatch[2].trim();

        currentHost.properties.push({
          key,
          value,
          enabled: true,
        });
      } else {
        // Check for commented property (for disabled hosts or disabled properties)
        const commentedPropertyMatch = trimmedLine.match(/^#\s*([A-Za-z][A-Za-z0-9]*)\s+(.+)$/);
        if (commentedPropertyMatch) {
          const key = commentedPropertyMatch[1];
          const value = commentedPropertyMatch[2].trim();

          currentHost.properties.push({
            key,
            value,
            enabled: false,
          });
        }
      }
    }
  }

  // Save last host
  if (currentHost) {
    if (currentGroup) {
      currentGroup.hosts.push(currentHost);
    } else {
      ungroupedHosts.push(currentHost);
    }
  }

  return {
    groups,
    ungroupedHosts,
  };
}

// Convert SSH config data back to string
export function stringifySSHConfig(data: SSHConfigData): string {
  const lines: string[] = [];

  // Add ungrouped hosts first
  data.ungroupedHosts.forEach((host, index) => {
    if (index > 0) {
      lines.push(''); // Add blank line between hosts
    }
    appendHost(lines, host);
  });

  // Add groups
  data.groups.forEach((group) => {
    if (lines.length > 0) {
      lines.push(''); // Add blank line before group
    }

    // Add group marker
    lines.push(`#$ ${group.name}`);
    lines.push('');

    // Add hosts in group
    group.hosts.forEach((host, index) => {
      if (index > 0) {
        lines.push(''); // Add blank line between hosts
      }
      appendHost(lines, host);
    });
  });

  return lines.join('\n');
}

// Append a host to lines array
function appendHost(lines: string[], host: SSHHostEntry): void {
  // Add tag comment
  lines.push(`# ${host.tag}`);

  // Add Host line
  const hostPrefix = host.enabled ? '' : '# ';
  lines.push(`${hostPrefix}Host ${host.host}`);

  // Add properties
  host.properties.forEach((prop) => {
    const indent = '    ';
    if (!host.enabled) {
      // Host is disabled, so all properties should be commented out
      lines.push(`#${indent}${prop.key} ${prop.value}`);
    } else {
      // Host is enabled, check if property is enabled
      if (prop.enabled) {
        lines.push(`${indent}${prop.key} ${prop.value}`);
      } else {
        // Property is disabled
        lines.push(`#${indent}${prop.key} ${prop.value}`);
      }
    }
  });
}
