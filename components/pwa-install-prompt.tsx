'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom">
      <div className="bg-card border-2 border-primary rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              🎁 Install GiftBuddy
            </h3>
            <p className="text-sm text-muted-foreground">
              Add GiftBuddy to your home screen for quick access
            </p>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-1 border border-border hover:bg-muted px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
