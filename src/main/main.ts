import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { getSSHConfigPath, fileExists, readFile, writeFile, createBackup, getFileModifiedTime } from '../utils/file-utils';
import { parseSSHConfig, stringifySSHConfig } from '../utils/ssh-config-parser';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#1e1e1e',
    title: 'SSH Config Editor',
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Setup IPC handlers
function setupIPCHandlers(): void {
  // Get SSH config file path
  ipcMain.handle('get-config-path', () => {
    return getSSHConfigPath();
  });

  // Check if file exists
  ipcMain.handle('file-exists', (event, filePath: string) => {
    return fileExists(filePath);
  });

  // Load SSH config
  ipcMain.handle('load-config', () => {
    try {
      const configPath = getSSHConfigPath();

      if (!fileExists(configPath)) {
        return {
          success: false,
          message: 'SSH config file not found. A new file will be created when you save.',
          data: null,
        };
      }

      const content = readFile(configPath);
      const data = parseSSHConfig(content);
      const lastModified = getFileModifiedTime(configPath);

      return {
        success: true,
        data,
        lastModified,
        path: configPath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error loading config: ${error}`,
        data: null,
      };
    }
  });

  // Save SSH config
  ipcMain.handle('save-config', (event, data: any) => {
    try {
      const configPath = getSSHConfigPath();

      // Create backup if file exists
      if (fileExists(configPath)) {
        const backupPath = createBackup(configPath);
        console.log(`Backup created: ${backupPath}`);
      }

      // Convert data to string and save
      const content = stringifySSHConfig(data);
      writeFile(configPath, content);

      return {
        success: true,
        message: 'Configuration saved successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error saving config: ${error}`,
      };
    }
  });
}

app.whenReady().then(() => {
  setupIPCHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
