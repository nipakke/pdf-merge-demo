/**
 * Activated state in ref.
 * Useful for checking if a keep-alive page is active or not.
 */
export function useActivated() {
  const state = shallowRef(true);
  onActivated(() => {
    state.value = true;
  });
  onDeactivated(() => {
    state.value = false;
  });

  return state;
}
