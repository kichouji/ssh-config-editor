import React, { useState, useMemo } from 'react';
import { SSHHostEntry, SSHProperty } from '../../types/ssh-config';
import { isMultiValueProperty, isToggleableProperty, COMMON_SSH_PROPERTIES } from '../../constants/ssh-properties';
import { detectDuplicateLocalForwardPorts } from '../../utils/validation-utils';

interface HostEditFormProps {
  host: SSHHostEntry;
  onSave: (host: SSHHostEntry) => void;
  onCancel: () => void;
}

interface PropertyGroup {
  key: string;
  properties: Array<SSHProperty & { originalIndex: number }>;
  isMultiValue: boolean;
  isToggleable: boolean;
}

const HostEditForm: React.FC<HostEditFormProps> = ({ host, onSave, onCancel }) => {
  const [editedHost, setEditedHost] = useState<SSHHostEntry>({ ...host });
  const [newPropertyKey, setNewPropertyKey] = useState<string>('');
  const [newPropertyValue, setNewPropertyValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Group properties by key
  const propertyGroups = useMemo(() => {
    const groups = new Map<string, Array<SSHProperty & { originalIndex: number }>>();

    editedHost.properties.forEach((prop, index) => {
      if (!groups.has(prop.key)) {
        groups.set(prop.key, []);
      }
      groups.get(prop.key)!.push({ ...prop, originalIndex: index });
    });

    const result: PropertyGroup[] = [];
    groups.forEach((properties, key) => {
      result.push({
        key,
        properties,
        isMultiValue: isMultiValueProperty(key),
        isToggleable: isToggleableProperty(key),
      });
    });

    return result;
  }, [editedHost.properties]);

  // Detect duplicate LocalForward ports (only for enabled entries)
  const duplicatePortIndices = useMemo(() => {
    return detectDuplicateLocalForwardPorts(editedHost.properties);
  }, [editedHost.properties]);

  const handleHostChange = (field: string, value: string) => {
    setEditedHost({
      ...editedHost,
      [field]: value,
    });
  };

  const handlePropertyValueChange = (propertyIndex: number, newValue: string) => {
    const newProperties = [...editedHost.properties];
    newProperties[propertyIndex] = {
      ...newProperties[propertyIndex],
      value: newValue,
    };
    setEditedHost({
      ...editedHost,
      properties: newProperties,
    });
  };

  const handleRemovePropertyValue = (propertyIndex: number) => {
    const newProperties = editedHost.properties.filter(
      (_, index) => index !== propertyIndex
    );
    setEditedHost({
      ...editedHost,
      properties: newProperties,
    });
  };

  const handleTogglePropertyEnabled = (propertyIndex: number) => {
    const newProperties = [...editedHost.properties];
    newProperties[propertyIndex] = {
      ...newProperties[propertyIndex],
      enabled: !newProperties[propertyIndex].enabled,
    };
    setEditedHost({
      ...editedHost,
      properties: newProperties,
    });
  };

  const handleMovePropertyUp = (propertyIndex: number) => {
    if (propertyIndex === 0) return; // Already at the top

    const newProperties = [...editedHost.properties];
    // Swap with previous property
    [newProperties[propertyIndex - 1], newProperties[propertyIndex]] =
      [newProperties[propertyIndex], newProperties[propertyIndex - 1]];

    setEditedHost({
      ...editedHost,
      properties: newProperties,
    });
  };

  const handleMovePropertyDown = (propertyIndex: number) => {
    if (propertyIndex === editedHost.properties.length - 1) return; // Already at the bottom

    const newProperties = [...editedHost.properties];
    // Swap with next property
    [newProperties[propertyIndex], newProperties[propertyIndex + 1]] =
      [newProperties[propertyIndex + 1], newProperties[propertyIndex]];

    setEditedHost({
      ...editedHost,
      properties: newProperties,
    });
  };

  const handleAddPropertyValue = (key: string) => {
    // Add an empty property value that user can fill in
    setEditedHost({
      ...editedHost,
      properties: [
        ...editedHost.properties,
        {
          key,
          value: '',
          enabled: true,
        },
      ],
    });
  };

  const handleAddProperty = () => {
    if (!newPropertyKey.trim() || !newPropertyValue.trim()) {
      setErrorMessage('Please enter both property key and value');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setEditedHost({
      ...editedHost,
      properties: [
        ...editedHost.properties,
        {
          key: newPropertyKey.trim(),
          value: newPropertyValue.trim(),
          enabled: true,
        },
      ],
    });
    setNewPropertyKey('');
    setNewPropertyValue('');
    setErrorMessage('');
  };

  const handleSave = () => {
    if (!editedHost.host.trim()) {
      setErrorMessage('Host pattern is required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Filter out properties with empty values
    const filteredProperties = editedHost.properties.filter(
      (prop) => prop.value.trim() !== ''
    );

    onSave({
      ...editedHost,
      properties: filteredProperties,
    });
  };

  return (
    <div className="host-edit-form">
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      <div className="form-group">
        <label>Host Pattern *</label>
        <input
          type="text"
          value={editedHost.host}
          onChange={(e) => handleHostChange('host', e.target.value)}
          placeholder="e.g., dev-server"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Tag</label>
        <input
          type="text"
          value={editedHost.tag}
          onChange={(e) => handleHostChange('tag', e.target.value)}
          placeholder="e.g., Development Server"
          className="form-input"
        />
      </div>

      <div className="form-section">
        <h4>Properties</h4>
        {propertyGroups.map((group) => (
          <div key={group.key} className="property-group">
            <div className="property-group-header">
              <span className="property-group-key">{group.key}</span>
              {group.isMultiValue && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAddPropertyValue(group.key)}
                >
                  + Add
                </button>
              )}
            </div>
            <div className="property-group-values">
              {group.properties.map((prop) => {
                const hasDuplicatePort = duplicatePortIndices.has(prop.originalIndex);
                const isFirst = prop.originalIndex === 0;
                const isLast = prop.originalIndex === editedHost.properties.length - 1;
                return (
                  <div key={prop.originalIndex} className="property-value-row">
                    <input
                      type="text"
                      value={prop.value}
                      onChange={(e) =>
                        handlePropertyValueChange(prop.originalIndex, e.target.value)
                      }
                      placeholder="Property value"
                      className={`form-input property-value-input ${hasDuplicatePort ? 'input-warning' : ''}`}
                      title={hasDuplicatePort ? 'Warning: Duplicate local port detected' : ''}
                    />
                    <div className="property-reorder-buttons">
                      <button
                        className="btn btn-sm btn-reorder"
                        onClick={() => handleMovePropertyUp(prop.originalIndex)}
                        disabled={isFirst}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="btn btn-sm btn-reorder"
                        onClick={() => handleMovePropertyDown(prop.originalIndex)}
                        disabled={isLast}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    {group.isToggleable && (
                      <button
                        className={`btn btn-sm ${prop.enabled ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => handleTogglePropertyEnabled(prop.originalIndex)}
                      >
                        {prop.enabled ? 'Disable' : 'Enable'}
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemovePropertyValue(prop.originalIndex)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <h4>Add Property</h4>
        <div className="property-add-container">
          <select
            className="form-input property-key-select"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setNewPropertyKey(e.target.value);
              }
            }}
          >
            <option value="">-- Select a property --</option>
            {COMMON_SSH_PROPERTIES.map((prop) => (
              <option key={prop} value={prop}>
                {prop}
              </option>
            ))}
          </select>
          <div className="property-edit-row">
            <input
              type="text"
              value={newPropertyKey}
              onChange={(e) => setNewPropertyKey(e.target.value)}
              placeholder="Or enter custom property key"
              className="form-input property-key-input"
            />
            <input
              type="text"
              value={newPropertyValue}
              onChange={(e) => setNewPropertyValue(e.target.value)}
              placeholder="Property value (e.g., 192.168.1.10)"
              className="form-input property-value-input"
            />
            <button className="btn btn-sm btn-success" onClick={handleAddProperty}>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default HostEditForm;
