import { DropResult } from '@hello-pangea/dnd';
import { SSHConfigData, SSHHostEntry, SSHHostGroup } from '../types/ssh-config';

/**
 * Parse drop result to extract source and destination information
 */
export interface DropLocation {
  isUngrouped: boolean;
  groupId: string | null;
  index: number;
}

export interface ParsedDropResult {
  source: DropLocation;
  destination: DropLocation;
}

export function parseDropResult(result: DropResult): ParsedDropResult | null {
  const { source, destination } = result;

  if (!destination) return null;
  if (source.droppableId === destination.droppableId && source.index === destination.index) {
    return null;
  }

  const parseLocation = (droppableId: string, index: number): DropLocation => {
    const isUngrouped = droppableId === 'ungrouped';
    const groupId = isUngrouped ? null : droppableId.replace('group-', '');
    return { isUngrouped, groupId, index };
  };

  return {
    source: parseLocation(source.droppableId, source.index),
    destination: parseLocation(destination.droppableId, destination.index),
  };
}

/**
 * Find the host being moved from config data
 */
export function findMovedHost(
  configData: SSHConfigData,
  location: DropLocation
): SSHHostEntry | null {
  if (location.isUngrouped) {
    return configData.ungroupedHosts[location.index] || null;
  }

  if (location.groupId) {
    const group = configData.groups.find(g => g.id === location.groupId);
    return group?.hosts[location.index] || null;
  }

  return null;
}

/**
 * Remove host from a location
 */
function removeHostFromLocation(
  ungroupedHosts: SSHHostEntry[],
  groups: SSHHostGroup[],
  location: DropLocation
): { ungroupedHosts: SSHHostEntry[]; groups: SSHHostGroup[] } {
  if (location.isUngrouped) {
    const newUngroupedHosts = [...ungroupedHosts];
    newUngroupedHosts.splice(location.index, 1);
    return { ungroupedHosts: newUngroupedHosts, groups };
  }

  if (location.groupId) {
    const newGroups = groups.map(g => ({ ...g, hosts: [...g.hosts] }));
    const groupIndex = newGroups.findIndex(g => g.id === location.groupId);
    if (groupIndex !== -1) {
      newGroups[groupIndex].hosts.splice(location.index, 1);
    }
    return { ungroupedHosts, groups: newGroups };
  }

  return { ungroupedHosts, groups };
}

/**
 * Add host to a location
 */
function addHostToLocation(
  ungroupedHosts: SSHHostEntry[],
  groups: SSHHostGroup[],
  location: DropLocation,
  host: SSHHostEntry
): { ungroupedHosts: SSHHostEntry[]; groups: SSHHostGroup[] } {
  if (location.isUngrouped) {
    const newUngroupedHosts = [...ungroupedHosts];
    newUngroupedHosts.splice(location.index, 0, host);
    return { ungroupedHosts: newUngroupedHosts, groups };
  }

  if (location.groupId) {
    const newGroups = [...groups];
    const groupIndex = newGroups.findIndex(g => g.id === location.groupId);
    if (groupIndex !== -1) {
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        hosts: [...newGroups[groupIndex].hosts],
      };
      newGroups[groupIndex].hosts.splice(location.index, 0, host);
    }
    return { ungroupedHosts, groups: newGroups };
  }

  return { ungroupedHosts, groups };
}

/**
 * Update host orders based on their current positions
 */
export function updateHostOrders(
  ungroupedHosts: SSHHostEntry[],
  groups: SSHHostGroup[]
): { ungroupedHosts: SSHHostEntry[]; groups: SSHHostGroup[] } {
  const newUngroupedHosts = ungroupedHosts.map((host, index) => ({
    ...host,
    order: index,
  }));

  const newGroups = groups.map(group => ({
    ...group,
    hosts: group.hosts.map((host, index) => ({
      ...host,
      order: index,
    })),
  }));

  return { ungroupedHosts: newUngroupedHosts, groups: newGroups };
}

/**
 * Perform the complete host move operation
 */
export function performHostMove(
  configData: SSHConfigData,
  parsedResult: ParsedDropResult,
  movedHost: SSHHostEntry
): SSHConfigData {
  // Remove from source
  let { ungroupedHosts, groups } = removeHostFromLocation(
    configData.ungroupedHosts,
    configData.groups,
    parsedResult.source
  );

  // Add to destination
  ({ ungroupedHosts, groups } = addHostToLocation(
    ungroupedHosts,
    groups,
    parsedResult.destination,
    movedHost
  ));

  // Update orders
  ({ ungroupedHosts, groups } = updateHostOrders(ungroupedHosts, groups));

  return { ungroupedHosts, groups };
}
