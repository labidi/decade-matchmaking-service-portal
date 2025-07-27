import React, { createContext, useContext, useState, ReactNode } from 'react';
import XHRAlertDialog from './XHRAlertDialog';

interface DialogState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'redirect' | 'loading';
  onConfirm?: () => void;
}

interface DialogContextType {
  showDialog: (message: string, type?: DialogState['type'], onConfirm?: () => void) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, message: '', type: 'info' });

  const showDialog = (message: string, type: DialogState['type'] = 'info', onConfirm?: () => void) => {
    setState({ open: true, message, type, onConfirm });
  };
  const closeDialog = () => setState(s => ({ ...s, open: false }));

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}
      <XHRAlertDialog
        open={state.open}
        onOpenChange={open => !open && closeDialog()}
        message={state.message}
        type={state.type}
        onConfirm={state.onConfirm}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
} 