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
