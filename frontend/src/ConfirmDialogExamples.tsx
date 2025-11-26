import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ConfirmDialog from './ConfirmDialog';

/**
 * Example usage of ConfirmDialog component
 * Shows how to integrate with package uninstall functionality
 */
export function PackageUninstallExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    name: string;
    displayName: string;
    isDangerous: boolean;
  } | null>(null);
  const [isUninstalling, setIsUninstalling] = useState(false);

  // Example packages
  const examplePackages = [
    {
      name: 'com.google.android.apps.maps',
      displayName: 'Google Maps',
      safetyLevel: 'Safe',
      isDangerous: false,
    },
    {
      name: 'com.facebook.katana',
      displayName: 'Facebook',
      safetyLevel: 'Caution',
      isDangerous: false,
    },
    {
      name: 'com.google.android.gms',
      displayName: 'Google Play Services',
      safetyLevel: 'Expert',
      isDangerous: true,
    },
    {
      name: 'com.android.systemui',
      displayName: 'System UI',
      safetyLevel: 'Dangerous',
      isDangerous: true,
    },
  ];

  const handleUninstallClick = (pkg: typeof examplePackages[0]) => {
    setSelectedPackage({
      name: pkg.name,
      displayName: pkg.displayName,
      isDangerous: pkg.isDangerous,
    });
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedPackage) return;

    setIsUninstalling(true);
    setDialogOpen(false);

    try {
      const result = await invoke<{
        success: boolean;
        message?: string;
        error?: string;
      }>('uninstall_package', {
        packageName: selectedPackage.name,
      });

      if (result.success) {
        alert(`✅ Successfully uninstalled ${selectedPackage.displayName}`);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setIsUninstalling(false);
      setSelectedPackage(null);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedPackage(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Package Uninstall Example
      </h2>

      <div className="space-y-2">
        {examplePackages.map((pkg) => (
          <div
            key={pkg.name}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700"
          >
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {pkg.displayName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {pkg.name}
              </div>
              <span
                className={
                  'text-xs px-2 py-1 mt-1 inline-block ' +
                  (pkg.safetyLevel === 'Safe'
                    ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-white'
                    : pkg.safetyLevel === 'Caution'
                    ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-600 dark:text-gray-900'
                    : pkg.safetyLevel === 'Expert'
                    ? 'bg-orange-100 text-orange-900 dark:bg-orange-600 dark:text-gray-900'
                    : 'bg-red-600 text-white')
                }
              >
                {pkg.safetyLevel}
              </span>
            </div>

            <button
              onClick={() => handleUninstallClick(pkg)}
              disabled={isUninstalling}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Uninstall
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={
          selectedPackage?.isDangerous
            ? '⚠️ Dangerous Operation'
            : 'Confirm Uninstall'
        }
        message={
          selectedPackage
            ? `Are you sure you want to uninstall "${selectedPackage.displayName}"? ${
                selectedPackage.isDangerous
                  ? 'This is a critical system component.'
                  : 'This action cannot be undone.'
              }`
            : ''
        }
        isDangerous={selectedPackage?.isDangerous ?? false}
      />

      {isUninstalling && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 shadow-lg">
          Uninstalling...
        </div>
      )}
    </div>
  );
}

/**
 * Simpler example showing basic usage
 */
export function SimpleConfirmExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        Show Confirm Dialog
      </button>

      <ConfirmDialog
        isOpen={open}
        onConfirm={() => {
          console.log('Confirmed!');
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        isDangerous={false}
      />
    </div>
  );
}

/**
 * Example with dangerous operation
 */
export function DangerousConfirmExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
      >
        Delete Everything (Dangerous)
      </button>

      <ConfirmDialog
        isOpen={open}
        onConfirm={() => {
          console.log('Dangerous action confirmed!');
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        title="⚠️ Dangerous Operation"
        message="This will permanently delete all data. This action cannot be undone."
        isDangerous={true}
      />
    </div>
  );
}
