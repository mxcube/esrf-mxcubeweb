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
