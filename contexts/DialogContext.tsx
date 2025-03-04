"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DialogResult<T> = T | false;

interface DialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  showCancelButton?: boolean;
}

interface DialogContextType {
  showDialog: <T>(options: DialogOptions) => Promise<DialogResult<T>>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogState, setDialogState] = useState<{
    options: DialogOptions;
    resolve: ((value: DialogResult<unknown>) => void) | null;
  }>({
    options: {
      title: "",
      description: "",
      confirmText: "確認",
      cancelText: "キャンセル",
      variant: "default",
      showCancelButton: true,
    },
    resolve: null,
  });

  const showDialog = <T,>(options: DialogOptions): Promise<DialogResult<T>> => {
    return new Promise((resolve) => {
      setDialogState({
        options: {
          ...dialogState.options,
          ...options,
        },
        resolve: resolve as ((value: DialogResult<unknown>) => void) | null,
      });
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    dialogState.resolve?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    dialogState.resolve?.(false);
  };

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            dialogState.resolve?.(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogState.options.title}</DialogTitle>
            <DialogDescription>
              {dialogState.options.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {dialogState.options.showCancelButton && (
              <Button variant="outline" onClick={handleCancel}>
                {dialogState.options.cancelText}
              </Button>
            )}
            <Button
              variant={dialogState.options.variant}
              onClick={handleConfirm}
            >
              {dialogState.options.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
