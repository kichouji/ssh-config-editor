import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Get SSH config file path
export function getSSHConfigPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.ssh', 'config');
}

// Check if file exists
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Read file content
export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

// Write file content
export function writeFile(filePath: string, content: string): void {
  try {
    // Ensure .ssh directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

// Create backup file
export function createBackup(filePath: string): string {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-');

    const backupPath = `${filePath}.backup.${timestamp}`;
    fs.copyFileSync(filePath, backupPath);

    return backupPath;
  } catch (error) {
    throw new Error(`Failed to create backup: ${error}`);
  }
}

// Get file modification time
export function getFileModifiedTime(filePath: string): Date | null {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch (error) {
    return null;
  }
}
