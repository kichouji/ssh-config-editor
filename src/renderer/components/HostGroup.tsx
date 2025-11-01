import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { SSHHostGroup, SSHHostEntry } from '../../types/ssh-config';
import HostCard from './HostCard';

interface HostGroupProps {
  group: SSHHostGroup;
  onEditHost?: (host: SSHHostEntry) => void;
  onDeleteHost?: (hostId: string) => void;
  onDuplicateHost?: (host: SSHHostEntry) => void;
  onToggleHostEnabled?: (hostId: string) => void;
  onEditGroupName?: (groupId: string, newName: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
}

const HostGroup: React.FC<HostGroupProps> = ({
  group,
  onEditHost,
  onDeleteHost,
  onDuplicateHost,
  onToggleHostEnabled,
  onEditGroupName,
  onDeleteGroup,
  expandAllTrigger,
  collapseAllTrigger,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.name);

  const handleSaveEdit = () => {
    if (editedName.trim() && onEditGroupName) {
      onEditGroupName(group.id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(group.name);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete group "${group.name}"? All hosts will be moved to ungrouped.`)) {
      onDeleteGroup?.(group.id);
    }
  };

  return (
    <div className="host-group" data-group-id={group.id}>
      <div className="group-header">
        {isEditing ? (
          <div className="group-name-edit">
            <span className="group-marker">#$</span>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="form-input group-name-input"
              autoFocus
            />
            <button className="btn btn-sm btn-primary" onClick={handleSaveEdit}>
              Save
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h3>
              <span className="group-marker">#$</span> {group.name}
            </h3>
            <div className="group-header-actions">
              <span className="group-count">{group.hosts.length} hosts</span>
              {onEditGroupName && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setIsEditing(true)}
                  title="Rename group"
                >
                  Rename
                </button>
              )}
              {onDeleteGroup && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleDelete}
                  title="Delete group"
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <Droppable droppableId={`group-${group.id}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`group-hosts ${snapshot.isDraggingOver ? 'dragging-over' : ''} ${group.hosts.length === 0 ? 'empty-group' : ''}`}
          >
            {group.hosts.length > 0 ? (
              group.hosts.map((host, index) => (
                <Draggable key={host.id} draggableId={host.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <HostCard
                        host={host}
                        dragHandleProps={provided.dragHandleProps}
                        onEdit={onEditHost}
                        onDelete={onDeleteHost}
                        onDuplicate={onDuplicateHost}
                        onToggleEnabled={onToggleHostEnabled}
                        expandAllTrigger={expandAllTrigger}
                        collapseAllTrigger={collapseAllTrigger}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="empty-group-placeholder">
                📥 Drag and drop hosts here
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default HostGroup;
