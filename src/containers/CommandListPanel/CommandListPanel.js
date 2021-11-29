import React from 'react';

import './CommandListPanel.css';

const ListItem = ({ commandName, colorCode, isCurrent, isActive }) => {
  return (
    <div className={`list-item ${isCurrent ? 'current' : ''} ${isActive ? 'active' : 'disabled'}`}>
      {commandName}{' '}
      {colorCode ? (
        <span style={{ backgroundColor: colorCode, color: '#6d6d6d' }}>{colorCode}</span>
      ) : null}
    </div>
  );
};

const CommandListPanel = ({ commands = [], currCommandIndex }) => {
  return (
    <div className={'CommandListPanel'}>
      {commands.map((command, index) => {
        return (
          <ListItem
            key={command.commandId}
            commandName={command.commandName}
            colorCode={command.colorCode}
            isCurrent={index === currCommandIndex}
            isActive={index <= currCommandIndex}
          />
        );
      })}
    </div>
  );
};

export default CommandListPanel;
