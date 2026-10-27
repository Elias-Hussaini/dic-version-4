import { create } from 'zustand';

interface UiState {
  toolsOpen: boolean;
  paletteOpen: boolean;
  online: boolean;
  setToolsOpen: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setOnline: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toolsOpen: false,
  paletteOpen: false,
  online: navigator.onLine,
  setToolsOpen: (toolsOpen) => set({ toolsOpen }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setOnline: (online) => set({ online }),
}));
