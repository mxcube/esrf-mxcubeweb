export function showArgusForm() {
  return {
    type: 'SHOW_ARGUS_FORM',
    show: true,
  };
}

export function hideArgusForm() {
  return {
    type: 'SHOW_ARGUS_FORM',
    show: false,
  };
}

export function showRecording() {
  return {
    type: 'SHOW_RECORDING',
    show: true,
  };
}

export function hideRecording() {
  return {
    type: 'SHOW_RECORDING',
    show: false,
  };
}
