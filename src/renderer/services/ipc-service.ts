import { ipcRenderer } from 'electron';
import { SSHConfigData } from '../../types/ssh-config';

export interface LoadConfigResult {
  success: boolean;
  message?: string;
  data?: SSHConfigData;
  lastModified?: Date;
  path?: string;
}

export interface SaveConfigResult {
  success: boolean;
  message: string;
}

// Get SSH config file path
export async function getConfigPath(): Promise<string> {
  return await ipcRenderer.invoke('get-config-path');
}

// Check if file exists
export async function fileExists(filePath: string): Promise<boolean> {
  return await ipcRenderer.invoke('file-exists', filePath);
}

// Load SSH config
export async function loadConfig(): Promise<LoadConfigResult> {
  return await ipcRenderer.invoke('load-config');
}

// Save SSH config
export async function saveConfig(data: SSHConfigData): Promise<SaveConfigResult> {
  return await ipcRenderer.invoke('save-config', data);
}
