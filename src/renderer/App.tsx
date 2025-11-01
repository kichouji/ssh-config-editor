import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSSHConfig } from '../hooks/useSSHConfig';
import HostCard from './components/HostCard';
import HostGroup from './components/HostGroup';
import SearchBox from './components/SearchBox';

const App: React.FC = () => {
  const {
    configData,
    filteredConfigData,
    loading,
    error,
    hasChanges,
    contentRef,
    searchQuery,
    showReloadConfirm,
    handleReload,
    confirmReload,
    cancelReload,
    handleSave,
    getTotalHostCount,
    handleDragEnd,
    handleNewHost,
    handleEditHost,
    handleDeleteHost,
    handleDuplicateHost,
    handleToggleHostEnabled,
    handleNewGroup,
    handleEditGroupName,
    handleDeleteGroup,
    handleSearchChange,
  } = useSSHConfig();

  const [expandAllTrigger, setExpandAllTrigger] = useState(0);
  const [collapseAllTrigger, setCollapseAllTrigger] = useState(0);

  const handleExpandAll = () => {
    setExpandAllTrigger((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setCollapseAllTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading SSH configuration...</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="app">
        <header className="header">
          <h1>SSH Config Editor</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleReload}>
              Reload
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save{hasChanges ? ' *' : ''}
            </button>
          </div>
        </header>

        <div className="container">
          <div className="toolbar">
            <div className="toolbar-left">
              <button className="btn btn-success" onClick={handleNewHost}>
                + New Host
              </button>
              <button className="btn btn-success" onClick={handleNewGroup}>
                + New Group
              </button>
              <div className="toolbar-separator"></div>
              <button className="btn btn-secondary" onClick={handleExpandAll}>
                Expand All
              </button>
              <button className="btn btn-secondary" onClick={handleCollapseAll}>
                Collapse All
              </button>
              <SearchBox
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search hosts..."
              />
            </div>
            <span className="host-count">{getTotalHostCount()} hosts</span>
          </div>

          {error && (
            <div className="alert alert-warning">
              {error}
            </div>
          )}

          {showReloadConfirm && (
            <div className="alert alert-confirm">
              <p className="confirm-message">
                You have unsaved changes. Are you sure you want to reload?
              </p>
              <div className="confirm-actions">
                <button className="btn btn-sm btn-danger" onClick={confirmReload}>
                  Reload
                </button>
                <button className="btn btn-sm btn-secondary" onClick={cancelReload}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="content" ref={contentRef}>
            {filteredConfigData &&
            (filteredConfigData.ungroupedHosts.length > 0 || filteredConfigData.groups.length > 0) ? (
              <>
                {/* Groups */}
                {filteredConfigData.groups.map((group) => (
                  <HostGroup
                    key={group.id}
                    group={group}
                    onEditHost={handleEditHost}
                    onDeleteHost={handleDeleteHost}
                    onDuplicateHost={handleDuplicateHost}
                    onToggleHostEnabled={handleToggleHostEnabled}
                    onEditGroupName={handleEditGroupName}
                    onDeleteGroup={handleDeleteGroup}
                    expandAllTrigger={expandAllTrigger}
                    collapseAllTrigger={collapseAllTrigger}
                  />
                ))}

                {/* Ungrouped hosts */}
                <Droppable droppableId="ungrouped">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''} ${filteredConfigData.ungroupedHosts.length === 0 ? 'empty-droppable' : ''}`}
                    >
                      {filteredConfigData.ungroupedHosts.length > 0 ? (
                        filteredConfigData.ungroupedHosts.map((host, index) => (
                          <Draggable key={host.id} draggableId={host.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <HostCard
                                  host={host}
                                  dragHandleProps={provided.dragHandleProps}
                                  onEdit={handleEditHost}
                                  onDelete={handleDeleteHost}
                                  onDuplicate={handleDuplicateHost}
                                  onToggleEnabled={handleToggleHostEnabled}
                                  expandAllTrigger={expandAllTrigger}
                                  collapseAllTrigger={collapseAllTrigger}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="empty-droppable-placeholder">
                          Drop hosts here (ungrouped)
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </>
            ) : (
              <p className="placeholder">
                {searchQuery ? 'No hosts found matching your search.' : 'No hosts configured yet. Click "+ New Host" to add a host.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default App;
