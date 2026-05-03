/**
 * ReturnX - Zustand Global Store
 * App settings, history, and AdMob tracking
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalcType =
  | 'SIP'
  | 'LumpSum'
  | 'FD'
  | 'RD'
  | 'EMI'
  | 'PPF'
  | 'SimpleInterest'
  | 'CompoundInterest'
  | 'Compare'
  | 'ReducingBalance'
  | 'SCSS'
  | 'POMIS'
  | 'SSY'
  | 'NSC'
  | 'SBIAnnuity'
  | 'LIC';

export interface HistoryEntry {
  id: string;
  type: CalcType;
  date: string;
  label: string;
  result: number;
  inputs: Record<string, number>;
}

export interface AppSettings {
  currency: '₹' | '$' | '€';
  riskThresholds: {
    conservative: number; // default 10
    moderate: number;     // default 15
  };
  darkMode: boolean;
  showAmortizationTable: boolean;
}

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // History
  history: HistoryEntry[];
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'date'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;

  // AdMob tracking
  calculationCount: number;
  incrementCalcCount: () => void;
  shouldShowInterstitial: () => boolean;

  // App state
  isLoading: boolean;
  setLoading: (val: boolean) => void;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const HISTORY_KEY = '@returnx_history';
const SETTINGS_KEY = '@returnx_settings';

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // Settings
  settings: {
    currency: '₹',
    riskThresholds: { conservative: 10, moderate: 15 },
    darkMode: true,
    showAmortizationTable: false,
  },

  updateSettings: async (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (_) {}
  },

  // History
  history: [],

  addHistory: async (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [newEntry, ...get().history].slice(0, 100); // max 100 entries
    set({ history: updated });
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (_) {}
  },

  clearHistory: async () => {
    set({ history: [] });
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (_) {}
  },

  loadHistory: async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) set({ history: JSON.parse(raw) });

      const settingsRaw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsRaw) set({ settings: JSON.parse(settingsRaw) });
    } catch (_) {}
  },

  // AdMob readiness
  calculationCount: 0,

  incrementCalcCount: () => {
    set((state) => ({ calculationCount: state.calculationCount + 1 }));
  },

  shouldShowInterstitial: () => {
    const count = get().calculationCount;
    // Future: if (count > 0 && count % 4 === 0) showInterstitialAd()
    return count > 0 && count % 4 === 0;
  },

  // App state
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
}));
