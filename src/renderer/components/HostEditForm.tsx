import React, { useState, useMemo } from 'react';
import { SSHHostEntry, SSHProperty } from '../../types/ssh-config';
import { isMultiValueProperty, isToggleableProperty, COMMON_SSH_PROPERTIES } from '../../constants/ssh-properties';

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
      alert('Please enter both property key and value');
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
  };

  const handleSave = () => {
    if (!editedHost.host.trim()) {
      alert('Host pattern is required');
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
              {group.properties.map((prop) => (
                <div key={prop.originalIndex} className="property-value-row">
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) =>
                      handlePropertyValueChange(prop.originalIndex, e.target.value)
                    }
                    placeholder="Property value"
                    className="form-input property-value-input"
                  />
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
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <h4>Add Property</h4>
        <div className="property-add-container">
          <div className="property-select-row">
            <label>Select from common properties:</label>
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
          </div>
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
