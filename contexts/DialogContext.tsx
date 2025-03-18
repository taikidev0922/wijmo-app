"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
      <AlertDialog
        open={isOpen}
        onOpenChange={(open: boolean) => {
          setIsOpen(open);
          if (!open) {
            dialogState.resolve?.(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogState.options.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dialogState.options.showCancelButton && (
              <AlertDialogCancel onClick={handleCancel}>
                {dialogState.options.cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className={
                dialogState.options.variant === "destructive"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
              onClick={handleConfirm}
            >
              {dialogState.options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
