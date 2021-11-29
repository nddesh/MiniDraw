export const addEventListeners = (workspace) => {
  document.addEventListener('keydown', (e) => {
    if (workspace.state.isCommandKeyPress && !workspace.state.isShiftKeyPress) {
      if (e.key === 'z') workspace.undo();
      if (e.key === 'Shift') workspace.setState({ isShiftKeyPress: true });
    } else if (workspace.state.isCommandKeyPress && workspace.state.isShiftKeyPress) {
      if (e.key === 'z') workspace.redo();
    } else if (workspace.state.isControlKeyPress) {
      if (e.key === 'z') workspace.undo();
      if (e.key === 'y') workspace.redo();
    } else {
      if (e.key === 'Meta') workspace.setState({ isCommandKeyPress: true });
      if (e.key === 'Control') workspace.setState({ isControlKeyPress: true });
      if (e.key === 'Shift') workspace.setState({ isShiftKeyPress: true });
    }
  });
  document.addEventListener('keyup', (e) => {
    if (workspace.state.isCommandKeyPress) {
      if (e.key === 'Meta') workspace.setState({ isCommandKeyPress: false });
    }
    if (workspace.state.isControlKeyPress) {
      if (e.key === 'Controle') workspace.setState({ isControleKeyPress: false });
    }
    if (workspace.state.isShiftKeyPress) {
      if (e.key === 'Shift') workspace.setState({ isShiftKeyPress: false });
    }
  });
};
