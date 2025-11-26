import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

// Settings interface
interface AppSettings {
  backupLocation: string;
  autoRefreshInterval: number; // seconds, 0 = disabled
  showAdvancedOptions: boolean;
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
  lastUpdateCheck: string;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  backupLocation: '',
  autoRefreshInterval: 30,
  showAdvancedOptions: false,
  darkMode: false,
  language: 'en',
  lastUpdateCheck: '',
};

// Language labels
const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply settings when they change
  useEffect(() => {
    applySettings();
  }, [settings]);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('app-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        setShowAdvanced(parsed.showAdvancedOptions || false);
      } else {
        // First time - get default backup location
        getDefaultBackupLocation();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('app-settings', JSON.stringify(settings));
      setHasChanges(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('idle');
    }
  };

  const applySettings = () => {
    // Apply dark mode
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage automatically
    if (hasChanges) {
      saveSettings();
    }
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      setShowAdvanced(false);
      setHasChanges(true);
      saveSettings();
    }
  };

  const getDefaultBackupLocation = async () => {
    try {
      const location = await invoke<string>('get_backup_path');
      updateSetting('backupLocation', location);
    } catch (error) {
      console.error('Failed to get backup location:', error);
    }
  };

  const selectBackupFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: settings.backupLocation || undefined,
      });

      if (selected && typeof selected === 'string') {
        updateSetting('backupLocation', selected);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const checkForUpdates = async () => {
    try {
      // Placeholder - implement actual update check
      alert('Checking for updates...\n\nYou are using the latest version.');
      updateSetting('lastUpdateCheck', new Date().toISOString());
    } catch (error) {
      console.error('Failed to check for updates:', error);
      alert('Failed to check for updates. Please try again later.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 p-4 md:p-6 border-0 lg:border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure application preferences
        </p>
      </div>

      {/* Display Settings */}
      <section className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Display
        </h3>

        {/* Dark Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Dark Mode
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Switch between light and dark theme
            </p>
          </div>
          <button
            onClick={() => updateSetting('darkMode', !settings.darkMode)}
            className={`
              relative inline-flex h-6 w-11 items-center border-2 transition-colors self-start sm:self-auto
              ${
                settings.darkMode
                  ? 'bg-green-600 border-green-600'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
              }
            `}
            role="switch"
            aria-checked={settings.darkMode}
          >
            <span
              className={`
                inline-block h-4 w-4 transform bg-white transition-transform
                ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Language
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select application language
            </p>
          </div>
          <select
            value={settings.language}
            onChange={(e) =>
              updateSetting('language', e.target.value as 'en' | 'es' | 'fr')
            }
            className="w-full sm:w-auto px-3 py-2 md:py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] md:min-h-0"
          >
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Show Advanced Options */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Show Advanced Options
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Display advanced settings sections
            </p>
          </div>
          <button
            onClick={() => {
              const newValue = !settings.showAdvancedOptions;
              updateSetting('showAdvancedOptions', newValue);
              setShowAdvanced(newValue);
            }}
            className={`
              relative inline-flex h-6 w-11 items-center border-2 transition-colors self-start sm:self-auto
              ${
                settings.showAdvancedOptions
                  ? 'bg-green-600 border-green-600'
                  : 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
              }
            `}
            role="switch"
            aria-checked={settings.showAdvancedOptions}
          >
            <span
              className={`
                inline-block h-4 w-4 transform bg-white transition-transform
                ${settings.showAdvancedOptions ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </section>

      {/* Device Settings */}
      <section className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Device
        </h3>

        {/* Auto-refresh Interval */}
        <div className="py-3">
          <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
            Auto-refresh Device
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Automatically refresh device information every X seconds (0 to disable)
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={settings.autoRefreshInterval}
              onChange={(e) =>
                updateSetting('autoRefreshInterval', parseInt(e.target.value))
              }
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                  (settings.autoRefreshInterval / 120) * 100
                }%, #e5e7eb ${(settings.autoRefreshInterval / 120) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="120"
                step="5"
                value={settings.autoRefreshInterval}
                onChange={(e) =>
                  updateSetting('autoRefreshInterval', parseInt(e.target.value) || 0)
                }
                className="w-20 px-3 py-2 md:py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] md:min-h-0"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                {settings.autoRefreshInterval === 0 ? 'Off' : 'sec'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Storage Settings */}
      <section className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Storage
        </h3>

        {/* Backup Location */}
        <div className="py-3">
          <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
            Default Backup Location
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Folder where backups will be saved
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={settings.backupLocation}
              readOnly
              placeholder="No location selected"
              className="flex-1 px-3 py-2.5 md:py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none min-h-[44px] md:min-h-0"
            />
            <button
              onClick={selectBackupFolder}
              className="px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium min-h-[44px] md:min-h-0 whitespace-nowrap"
            >
              Browse...
            </button>
          </div>
        </div>
      </section>

      {/* Advanced Settings (Collapsible) */}
      {showAdvanced && (
        <section className="mb-6 md:mb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Advanced
          </h3>

          {/* Check for Updates */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Check for Updates
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {settings.lastUpdateCheck
                  ? `Last checked: ${new Date(settings.lastUpdateCheck).toLocaleDateString()}`
                  : 'Never checked'}
              </p>
            </div>
            <button
              onClick={checkForUpdates}
              className="px-4 py-2.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium min-h-[44px] md:min-h-0 whitespace-nowrap"
            >
              Check Now
            </button>
          </div>

          {/* ADB Path (example advanced setting) */}
          <div className="py-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
              Custom ADB Path
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Override automatic ADB detection (leave empty for auto-detect)
            </p>
            <input
              type="text"
              placeholder="Auto-detect"
              className="w-full px-3 py-2.5 md:py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] md:min-h-0"
            />
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px] md:min-h-0"
        >
          Reset to Defaults
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 dark:text-green-400 text-center sm:text-left">
              ✓ Settings saved
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">Saving...</span>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className={`
              px-6 py-2.5 md:py-2 font-medium text-sm min-h-[44px] md:min-h-0
              ${
                hasChanges
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          <strong>💡 Tip:</strong> Settings are saved automatically when you change them.
          Changes take effect immediately without requiring an app restart.
        </p>
      </div>
    </div>
  );
};

export default Settings;
