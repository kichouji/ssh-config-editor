// SSH properties that can have multiple values
export const MULTI_VALUE_PROPERTIES = [
  'LocalForward',
  'RemoteForward',
  'DynamicForward',
  'IdentityFile',
  'SendEnv',
  'SetEnv',
  'CertificateFile',
  'CanonicalDomains',
];

// Properties that support individual enable/disable
export const TOGGLEABLE_PROPERTIES = [
  'LocalForward',
  'RemoteForward',
  'DynamicForward',
];

// Default properties to show in edit form
export const DEFAULT_PROPERTIES = [
  'HostName',
  'User',
  'Port',
  'IdentityFile',
  'ProxyJump',
  'ForwardAgent',
  'LocalForward',
  'RemoteForward',
  'DynamicForward',
];

// Common SSH properties for autocomplete
export const COMMON_SSH_PROPERTIES = [
  'HostName',
  'User',
  'Port',
  'IdentityFile',
  'ProxyJump',
  'ProxyCommand',
  'ForwardAgent',
  'LocalForward',
  'RemoteForward',
  'DynamicForward',
  'ServerAliveInterval',
  'ServerAliveCountMax',
  'Compression',
  'ControlMaster',
  'ControlPath',
  'ControlPersist',
  'StrictHostKeyChecking',
  'UserKnownHostsFile',
  'ConnectTimeout',
  'AddressFamily',
  'BindAddress',
  'ChallengeResponseAuthentication',
  'CheckHostIP',
  'Ciphers',
  'ConnectionAttempts',
  'EscapeChar',
  'GatewayPorts',
  'GlobalKnownHostsFile',
  'HashKnownHosts',
  'HostbasedAuthentication',
  'HostKeyAlgorithms',
  'IdentitiesOnly',
  'KbdInteractiveAuthentication',
  'LogLevel',
  'MACs',
  'NoHostAuthenticationForLocalhost',
  'NumberOfPasswordPrompts',
  'PasswordAuthentication',
  'PermitLocalCommand',
  'PKCS11Provider',
  'PreferredAuthentications',
  'PubkeyAuthentication',
  'RekeyLimit',
  'RequestTTY',
  'SendEnv',
  'SetEnv',
  'TCPKeepAlive',
  'UpdateHostKeys',
  'VerifyHostKeyDNS',
  'VisualHostKey',
  'CertificateFile',
  'CanonicalDomains',
];

// Check if a property can have multiple values
export function isMultiValueProperty(key: string): boolean {
  return MULTI_VALUE_PROPERTIES.includes(key);
}

// Check if a property supports individual enable/disable
export function isToggleableProperty(key: string): boolean {
  return TOGGLEABLE_PROPERTIES.includes(key);
}

// Extract local port number from LocalForward value
// Formats:
//   - Space-separated: "port host:hostport" (e.g., "8080 localhost:80")
//   - Space-separated with bind: "bind_address:port host:hostport" (e.g., "127.0.0.1:8080 localhost:80")
//   - Colon-separated: "port:host:hostport" (e.g., "8080:localhost:80")
//   - Colon-separated with bind: "bind_address:port:host:hostport" (e.g., "127.0.0.1:8080:localhost:80")
export function extractLocalForwardPort(value: string): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  // First, check if it's space-separated format
  if (trimmedValue.includes(' ')) {
    const spaceParts = trimmedValue.split(/\s+/);
    if (spaceParts.length >= 2) {
      const firstPart = spaceParts[0];

      // Check if first part contains colon (bind_address:port format)
      if (firstPart.includes(':')) {
        const colonParts = firstPart.split(':');
        // Return the last part before the space (the port)
        return colonParts[colonParts.length - 1];
      }

      // Otherwise, first part is just the port
      return firstPart;
    }
  }

  // Fallback to colon-separated format
  const parts = trimmedValue.split(':');

  // Format: port:host:hostport (3 parts)
  if (parts.length === 3) {
    return parts[0];
  }

  // Format: bind_address:port:host:hostport (4 parts)
  if (parts.length === 4) {
    return parts[1];
  }

  return null;
}
