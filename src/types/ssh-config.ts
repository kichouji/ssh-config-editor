// SSH Config Property (key-value pair)
export interface SSHProperty {
  key: string;
  value: string;
  enabled: boolean; // For LocalForward, RemoteForward, DynamicForward
}

// SSH Host Entry
export interface SSHHostEntry {
  id: string; // Unique identifier
  host: string; // Host pattern (e.g., "dev-server")
  tag: string; // Tag from comment above Host line
  enabled: boolean; // Whether the host is enabled or commented out
  properties: SSHProperty[]; // All SSH properties
  order: number; // Order in the file
}

// SSH Host Group
export interface SSHHostGroup {
  id: string; // Unique identifier
  name: string; // Group name from #$ line
  hosts: SSHHostEntry[]; // Hosts in this group
  order: number; // Order in the file
}

// SSH Config Data (complete structure)
export interface SSHConfigData {
  groups: SSHHostGroup[]; // All groups
  ungroupedHosts: SSHHostEntry[]; // Hosts not in any group
}

// File information
export interface SSHConfigFileInfo {
  path: string;
  exists: boolean;
  lastModified?: Date;
}
