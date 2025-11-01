# SSH Config Editor

A modern GUI application for visually editing SSH configuration files (`~/.ssh/config`) on Windows.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- 🖱️ **Intuitive GUI** - Visual editing of SSH config files
- 📁 **Collapsible View** - Expand/collapse individual host configurations
- 🎨 **Property Editor** - Appropriate input forms for each property type
- 💾 **Auto-formatting** - Proper indentation and spacing on save
- 🔒 **Auto-backup** - Automatic backup before saving changes
- 🎨 **Dark Theme** - Modern VS Code-inspired UI

### Advanced Features
- 🔍 **Search & Filter** - Search across host patterns, tags, and properties with debounced input
  - Multiple keyword search with AND logic
  - Real-time filtering as you type
- 🔄 **Drag & Drop** - Reorder hosts and move between groups freely
- 📋 **Group Management** - Organize hosts into custom groups with `#$` markers
- 🏷️ **Tag Support** - Add descriptive comments above host entries
- ✅ **Enable/Disable Toggle** - Individually disable hosts or properties (comment out)
- 🔢 **Multi-value Properties** - Support for properties with multiple values:
  - `LocalForward`, `RemoteForward`, `DynamicForward` (with individual enable/disable)
  - `IdentityFile`, `SendEnv`, `SetEnv`
  - `CertificateFile`, `CanonicalDomains`
- 📊 **Host Statistics** - Track total host count across groups
- 🎯 **Smart Scrolling** - Auto-scroll to newly created hosts and groups
- ♻️ **Duplicate Hosts** - Quick duplication of existing configurations
- 📂 **Expand/Collapse All** - Quickly expand or collapse all host configurations at once
- 📝 **Property Autocomplete** - Dropdown list of common SSH properties with custom input support

## Technology Stack

- **Electron** 28.0.0 - Desktop application framework
- **React** 18.2.0 - UI library
- **TypeScript** 5.3.3 - Type-safe development
- **Webpack** 5 - Module bundler
- **@hello-pangea/dnd** - Drag & drop functionality

## Requirements

- **Windows 10/11**
- **Node.js** 20.x or higher
- **npm** 10.x or higher

## Installation

### Option 1: From Release (Recommended)

1. Download the latest release from the [Releases](../../releases) page
2. Choose either:
   - **Installer version** (`SSH Config Editor Setup x.x.x.exe`) - Includes installer wizard
   - **Portable version** (`SSH Config Editor x.x.x.exe`) - No installation required

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/ssh-config-editor.git
cd ssh-config-editor

# Install dependencies
npm install

# Build the application
npm run build

# Run the application
npm start
```

## Usage

### Basic Operations

1. **Launch the application** - The app automatically loads your SSH config from `~/.ssh/config`
2. **Add a new host** - Click the "+ New Host" button
3. **Edit a host** - Click on a host card to expand, then click "Edit"
4. **Reorder hosts** - Drag and drop hosts using the drag handle (⋮⋮)
5. **Save changes** - Click the "Save" button in the header
6. **Reload** - Click "Reload" to discard changes and reload from file

### Search Operations

1. **Search hosts** - Type in the search box to filter hosts in real-time
2. **Multiple keywords** - Separate keywords with spaces for AND search (e.g., "prod server")
3. **Clear search** - Click the × button or clear the text to show all hosts
4. **Expand/Collapse all** - Use "Expand All" or "Collapse All" buttons to manage visibility

### Group Management

1. **Create a group** - Click the "+ New Group" button
2. **Rename a group** - Click "Rename" on the group header
3. **Delete a group** - Click "Delete" (hosts will be moved to ungrouped)
4. **Move hosts to group** - Drag and drop hosts into group areas

### Property Management

- **Add property** - Use the "Add Property" section in edit mode
  - Click or type in the property name field to see a dropdown list of common SSH properties
  - Select from the list or type a custom property name
- **Multi-value properties** - Click "+ Add value" for properties that support multiple values
- **Enable/Disable property** - Toggle individual properties on/off
- **Delete property** - Click the delete button next to each property

### SSH Config Format

The editor preserves special SSH config syntax:

```ssh
# This is a tag comment for the host below
Host example-server
    HostName example.com
    User admin
    Port 22
    IdentityFile ~/.ssh/id_rsa

#$ Production Servers
Host prod-1
    HostName prod1.example.com
    User deploy

Host prod-2
    HostName prod2.example.com
    User deploy

# Disabled host (commented out)
#Host old-server
#    HostName old.example.com
#    User admin
```

- **Tags**: Comments directly above a `Host` line are treated as tags
- **Groups**: Lines starting with `#$` create named groups
- **Disabled hosts**: Commented-out hosts are shown with reduced opacity

## Development

### Project Structure

```
ssh-config-editor/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React UI components
│   │   ├── components/    # React components
│   │   └── styles.css     # Global styles
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   │   ├── ssh-config-parser.ts
│   │   ├── file-utils.ts
│   │   └── host-operations.ts
│   ├── types/             # TypeScript type definitions
│   └── constants/         # Constants and configurations
├── dist/                  # Build output
└── package.json
```

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start the application
npm start

# Build distributable packages
npm run dist
```

### Building Distributable Packages

The project uses `electron-builder` to create distributable packages:

```bash
# Build the application first
npm run build

# Create distributable packages
npm run dist
```

Output files will be created in the `release/` directory:
- `SSH Config Editor Setup x.x.x.exe` - Installer version
- `SSH Config Editor x.x.x.exe` - Portable version

## SSH Config Backup

The application automatically creates backups before saving:
- Backups are stored in the same directory as the config file
- Format: `config.backup.YYYYMMDD_HHMMSS`
- Only the most recent 5 backups are kept

## Known Limitations

- Windows only (macOS and Linux support planned)
- Does not support all SSH config directives (most common ones are supported)
- Match blocks and Include directives are not yet supported

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

---

**Note**: This application modifies your SSH configuration file. Always keep backups of important configurations.
