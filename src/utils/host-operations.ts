import { SSHConfigData, SSHHostEntry, SSHHostGroup } from '../types/ssh-config';

/**
 * Find host location in config data
 * @returns { location: 'ungrouped' | 'group', index: number, groupIndex?: number }
 */
function findHostLocation(
  configData: SSHConfigData,
  hostId: string
): { location: 'ungrouped' | 'group'; index: number; groupIndex?: number } | null {
  // Try to find in ungrouped hosts
  const ungroupedIndex = configData.ungroupedHosts.findIndex(h => h.id === hostId);
  if (ungroupedIndex !== -1) {
    return { location: 'ungrouped', index: ungroupedIndex };
  }

  // Try to find in groups
  for (let groupIndex = 0; groupIndex < configData.groups.length; groupIndex++) {
    const hostIndex = configData.groups[groupIndex].hosts.findIndex(h => h.id === hostId);
    if (hostIndex !== -1) {
      return { location: 'group', index: hostIndex, groupIndex };
    }
  }

  return null;
}

/**
 * Find a host in config data and apply a transformation
 */
export function updateHostInConfig(
  configData: SSHConfigData,
  hostId: string,
  updateFn: (host: SSHHostEntry) => SSHHostEntry
): SSHConfigData | null {
  const location = findHostLocation(configData, hostId);
  if (!location) return null;

  if (location.location === 'ungrouped') {
    const newHosts = [...configData.ungroupedHosts];
    newHosts[location.index] = updateFn(newHosts[location.index]);
    return {
      ...configData,
      ungroupedHosts: newHosts,
    };
  }

  // Update in group
  const newGroups = [...configData.groups];
  const group = newGroups[location.groupIndex!];
  const newHosts = [...group.hosts];
  newHosts[location.index] = updateFn(newHosts[location.index]);
  newGroups[location.groupIndex!] = { ...group, hosts: newHosts };

  return {
    ...configData,
    groups: newGroups,
  };
}

/**
 * Delete a host from config data
 */
export function deleteHostFromConfig(
  configData: SSHConfigData,
  hostId: string
): SSHConfigData | null {
  const location = findHostLocation(configData, hostId);
  if (!location) return null;

  if (location.location === 'ungrouped') {
    return {
      ...configData,
      ungroupedHosts: configData.ungroupedHosts.filter(h => h.id !== hostId),
    };
  }

  // Delete from group
  const newGroups = [...configData.groups];
  const group = newGroups[location.groupIndex!];
  newGroups[location.groupIndex!] = {
    ...group,
    hosts: group.hosts.filter(h => h.id !== hostId),
  };

  return {
    ...configData,
    groups: newGroups,
  };
}

/**
 * Insert a host after another host in config data
 */
export function insertHostAfter(
  configData: SSHConfigData,
  targetHostId: string,
  newHost: SSHHostEntry
): SSHConfigData | null {
  const location = findHostLocation(configData, targetHostId);
  if (!location) return null;

  if (location.location === 'ungrouped') {
    const newHosts = [...configData.ungroupedHosts];
    newHosts.splice(location.index + 1, 0, newHost);
    return {
      ...configData,
      ungroupedHosts: newHosts,
    };
  }

  // Insert in group
  const newGroups = [...configData.groups];
  const group = newGroups[location.groupIndex!];
  const newHosts = [...group.hosts];
  newHosts.splice(location.index + 1, 0, newHost);
  newGroups[location.groupIndex!] = { ...group, hosts: newHosts };

  return {
    ...configData,
    groups: newGroups,
  };
}

/**
 * Generate a unique ID (for hosts, groups, etc.)
 */
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for hosts
 */
export function generateHostId(): string {
  return generateUniqueId();
}

/**
 * Generate a unique ID for groups
 */
export function generateGroupId(): string {
  return generateUniqueId();
}
