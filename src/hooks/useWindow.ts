import { useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function useWindow() {
  const hideWindow = useCallback(async () => {
    const window = getCurrentWindow();
    await window.hide();
  }, []);

  return { hideWindow };
}