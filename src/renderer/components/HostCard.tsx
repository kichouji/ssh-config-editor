import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { SSHHostEntry, SSHProperty } from '../../types/ssh-config';
import HostEditForm from './HostEditForm';
import { extractLocalForwardPort } from '../../constants/ssh-properties';

interface HostCardProps {
  host: SSHHostEntry;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onEdit?: (host: SSHHostEntry) => void;
  onDelete?: (hostId: string) => void;
  onDuplicate?: (host: SSHHostEntry) => void;
  onToggleEnabled?: (hostId: string) => void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
}

const HostCard: React.FC<HostCardProps> = ({
  host,
  dragHandleProps,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleEnabled,
  expandAllTrigger,
  collapseAllTrigger,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle expand all trigger
  useEffect(() => {
    if (expandAllTrigger !== undefined && expandAllTrigger > 0) {
      setIsExpanded(true);
    }
  }, [expandAllTrigger]);

  // Handle collapse all trigger
  useEffect(() => {
    if (collapseAllTrigger !== undefined && collapseAllTrigger > 0) {
      setIsExpanded(false);
    }
  }, [collapseAllTrigger]);

  const toggleExpand = (e: React.MouseEvent) => {
    // Don't toggle when clicking the drag handle
    if ((e.target as HTMLElement).classList.contains('drag-handle')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (editedHost: SSHHostEntry) => {
    if (onEdit) {
      onEdit(editedHost);
    }
    setIsEditing(false);

    // Scroll to this host card after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(host.id);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(host);
    }
  };

  const handleToggleEnabled = () => {
    if (onToggleEnabled) {
      onToggleEnabled(host.id);
    }
  };

  // Detect duplicate LocalForward ports (only for enabled entries)
  const duplicatePortIndices = useMemo(() => {
    const duplicates = new Set<number>();
    const portToIndices = new Map<string, number[]>();

    // Collect all LocalForward entries with their ports
    host.properties.forEach((prop, index) => {
      if (prop.key === 'LocalForward' && prop.enabled) {
        const port = extractLocalForwardPort(prop.value);
        if (port) {
          if (!portToIndices.has(port)) {
            portToIndices.set(port, []);
          }
          portToIndices.get(port)!.push(index);
        }
      }
    });

    // Mark indices with duplicate ports
    portToIndices.forEach((indices) => {
      if (indices.length > 1) {
        indices.forEach(index => duplicates.add(index));
      }
    });

    return duplicates;
  }, [host.properties]);

  return (
    <div ref={cardRef} className={`host-card ${!host.enabled ? 'disabled' : ''}`}>
      <div className="host-card-header" onClick={toggleExpand}>
        <div className="host-card-title">
          <span className="drag-handle" {...dragHandleProps}>⋮⋮</span>
          <span className="expand-icon">{isExpanded ? '▾' : '▸'}</span>
          <span className="host-name">
            {!host.enabled && '# '}Host {host.host}
          </span>
          <span className="host-tag">{host.tag !== host.host && `(${host.tag})`}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="host-card-body">
          {isEditing ? (
            <HostEditForm
              host={host}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <>
              {host.properties.length > 0 ? (
                <div className="properties-list">
                  {host.properties.map((prop, index) => {
                    const hasDuplicatePort = duplicatePortIndices.has(index);
                    return (
                      <div
                        key={index}
                        className={`property-item ${!prop.enabled ? 'disabled' : ''} ${hasDuplicatePort ? 'property-warning' : ''}`}
                        title={hasDuplicatePort ? 'Warning: Duplicate local port detected' : ''}
                      >
                        <span className="property-key">{prop.key}</span>
                        <span className="property-value">{prop.value}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-properties">No properties configured</p>
              )}

              {showDeleteConfirm ? (
                <div className="confirm-dialog">
                  <p className="confirm-message">
                    Are you sure you want to delete host "{host.host}"?
                  </p>
                  <div className="confirm-actions">
                    <button className="btn btn-sm btn-danger" onClick={confirmDelete}>
                      Delete
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelDelete}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="host-card-actions">
                  <button className="btn btn-sm btn-secondary" onClick={handleEdit}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={handleDuplicate}>
                    Duplicate
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={handleToggleEnabled}>
                    {host.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HostCard;
