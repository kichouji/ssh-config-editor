import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { SSHConfigData, SSHHostEntry } from '../types/ssh-config';
import { loadConfig, saveConfig } from '../renderer/services/ipc-service';
import {
  updateHostInConfig,
  deleteHostFromConfig,
  insertHostAfter,
  generateHostId,
  generateGroupId,
} from '../utils/host-operations';
import { searchHosts } from '../utils/search-utils';
import { parseDropResult, findMovedHost, performHostMove } from '../utils/drag-drop-utils';

export function useSSHConfig() {
  const [configData, setConfigData] = useState<SSHConfigData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [newlyAddedHostId, setNewlyAddedHostId] = useState<string | null>(null);
  const [newlyAddedGroupId, setNewlyAddedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when a new host is added
  useEffect(() => {
    if (newlyAddedHostId && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTo({
            top: contentRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
        setNewlyAddedHostId(null);
      }, 100);
    }
  }, [newlyAddedHostId]);

  // Auto-scroll when a new group is added
  useEffect(() => {
    if (newlyAddedGroupId && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          const groupElement = document.querySelector(`[data-group-id="${newlyAddedGroupId}"]`);
          if (groupElement) {
            groupElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
        setNewlyAddedGroupId(null);
      }, 100);
    }
  }, [newlyAddedGroupId]);

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadConfig();

      if (result.success && result.data) {
        setConfigData(result.data);
      } else {
        setError(result.message || 'Failed to load configuration');
        setConfigData({
          groups: [],
          ungroupedHosts: [],
        });
      }
    } catch (err) {
      setError(`Error: ${err}`);
      setConfigData({
        groups: [],
        ungroupedHosts: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const handleReload = useCallback(() => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to reload?')) {
        loadConfiguration();
        setHasChanges(false);
      }
    } else {
      loadConfiguration();
    }
  }, [hasChanges, loadConfiguration]);

  const handleSave = useCallback(async () => {
    if (!configData) return;

    try {
      const result = await saveConfig(configData);

      if (result.success) {
        setHasChanges(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert(`Error saving configuration: ${err}`);
    }
  }, [configData]);

  const getTotalHostCount = useCallback((): number => {
    if (!configData) return 0;

    const ungroupedCount = configData.ungroupedHosts.length;
    const groupedCount = configData.groups.reduce(
      (sum, group) => sum + group.hosts.length,
      0
    );

    return ungroupedCount + groupedCount;
  }, [configData]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!configData) return;

    // Parse the drop result
    const parsedResult = parseDropResult(result);
    if (!parsedResult) return;

    // Find the host being moved
    const movedHost = findMovedHost(configData, parsedResult.source);
    if (!movedHost) return;

    // Perform the move operation
    const newConfigData = performHostMove(configData, parsedResult, movedHost);

    setConfigData(newConfigData);
    setHasChanges(true);
  }, [configData]);

  const handleNewHost = useCallback(() => {
    if (!configData) return;

    const newHostId = generateHostId();
    const newHost: SSHHostEntry = {
      id: newHostId,
      host: 'new-host',
      tag: 'new-host',
      enabled: true,
      properties: [],
      order: configData.ungroupedHosts.length,
    };

    setConfigData({
      ...configData,
      ungroupedHosts: [...configData.ungroupedHosts, newHost],
    });
    setHasChanges(true);
    setNewlyAddedHostId(newHostId);
  }, [configData]);

  const handleEditHost = useCallback((editedHost: SSHHostEntry) => {
    if (!configData) return;

    const newConfig = updateHostInConfig(configData, editedHost.id, () => editedHost);
    if (newConfig) {
      setConfigData(newConfig);
      setHasChanges(true);
    }
  }, [configData]);

  const handleDeleteHost = useCallback((hostId: string) => {
    if (!configData) return;

    const newConfig = deleteHostFromConfig(configData, hostId);
    if (newConfig) {
      setConfigData(newConfig);
      setHasChanges(true);
    }
  }, [configData]);

  const handleDuplicateHost = useCallback((host: SSHHostEntry) => {
    if (!configData) return;

    const duplicatedHost: SSHHostEntry = {
      ...host,
      id: generateHostId(),
      host: `${host.host}-copy`,
      tag: `${host.tag}-copy`,
      order: host.order + 1,
    };

    const newConfig = insertHostAfter(configData, host.id, duplicatedHost);
    if (newConfig) {
      setConfigData(newConfig);
      setHasChanges(true);
    }
  }, [configData]);

  const handleToggleHostEnabled = useCallback((hostId: string) => {
    if (!configData) return;

    const newConfig = updateHostInConfig(configData, hostId, (host) => {
      const newEnabled = !host.enabled;
      return {
        ...host,
        enabled: newEnabled,
        // When enabling a host, also enable all properties
        properties: newEnabled
          ? host.properties.map(prop => ({ ...prop, enabled: true }))
          : host.properties,
      };
    });

    if (newConfig) {
      setConfigData(newConfig);
      setHasChanges(true);
    }
  }, [configData]);

  const handleNewGroup = useCallback(() => {
    if (!configData) return;

    const newGroupId = generateGroupId();
    const newGroup = {
      id: newGroupId,
      name: 'New Group',
      hosts: [],
      order: configData.groups.length,
    };

    setConfigData({
      ...configData,
      groups: [...configData.groups, newGroup],
    });
    setHasChanges(true);
    setNewlyAddedGroupId(newGroupId);
  }, [configData]);

  const handleEditGroupName = useCallback((groupId: string, newName: string) => {
    if (!configData) return;

    const newGroups = configData.groups.map(group =>
      group.id === groupId ? { ...group, name: newName } : group
    );

    setConfigData({
      ...configData,
      groups: newGroups,
    });
    setHasChanges(true);
  }, [configData]);

  const handleDeleteGroup = useCallback((groupId: string) => {
    if (!configData) return;

    const groupToDelete = configData.groups.find(g => g.id === groupId);
    if (!groupToDelete) return;

    // If group has hosts, move them to ungrouped
    const newUngroupedHosts = [
      ...configData.ungroupedHosts,
      ...groupToDelete.hosts,
    ];

    const newGroups = configData.groups.filter(g => g.id !== groupId);

    setConfigData({
      ...configData,
      ungroupedHosts: newUngroupedHosts,
      groups: newGroups,
    });
    setHasChanges(true);
  }, [configData]);

  // Filter config data by search query
  const filteredConfigData = useMemo<SSHConfigData | null>(() => {
    if (!configData) return null;
    if (!searchQuery || searchQuery.trim() === '') return configData;

    // Filter ungrouped hosts
    const filteredUngroupedHosts = searchHosts(configData.ungroupedHosts, searchQuery);

    // Filter hosts in each group
    const filteredGroups = configData.groups.map(group => ({
      ...group,
      hosts: searchHosts(group.hosts, searchQuery),
    }));

    return {
      ungroupedHosts: filteredUngroupedHosts,
      groups: filteredGroups,
    };
  }, [configData, searchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    // State
    configData,
    filteredConfigData,
    loading,
    error,
    hasChanges,
    contentRef,
    searchQuery,

    // Host Actions
    handleReload,
    handleSave,
    getTotalHostCount,
    handleDragEnd,
    handleNewHost,
    handleEditHost,
    handleDeleteHost,
    handleDuplicateHost,
    handleToggleHostEnabled,

    // Group Actions
    handleNewGroup,
    handleEditGroupName,
    handleDeleteGroup,

    // Search Actions
    handleSearchChange,
  };
}
