"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WijmoDialog } from "@/components/wijmo-dialog";

interface WijmoDialogOptions {
  title: string;
  content: ReactNode;
}

interface WijmoDialogContextType {
  showWijmoDialog: (options: WijmoDialogOptions) => void;
  handleClose: () => void;
}

const WijmoDialogContext = createContext<WijmoDialogContextType | undefined>(
  undefined
);

export function WijmoDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogState, setDialogState] = useState<WijmoDialogOptions>({
    title: "",
    content: null,
  });

  const showWijmoDialog = (options: WijmoDialogOptions) => {
    setDialogState(options);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <WijmoDialogContext.Provider value={{ showWijmoDialog, handleClose }}>
      {children}
      <WijmoDialog title={dialogState.title} isOpen={isOpen}>
        {dialogState.content}
      </WijmoDialog>
    </WijmoDialogContext.Provider>
  );
}

export function useWijmoDialog() {
  const context = useContext(WijmoDialogContext);
  if (context === undefined) {
    throw new Error("useWijmoDialog must be used within a WijmoDialogProvider");
  }
  return context;
}
