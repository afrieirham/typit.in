import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ErrorDialog({
  errorMessage,
  onClickAction,
}: {
  errorMessage: string;
  onClickAction: () => void;
}) {
  return (
    <AlertDialog open={!!errorMessage}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opps, sorry!</AlertDialogTitle>
          <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClickAction}>Okay</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
