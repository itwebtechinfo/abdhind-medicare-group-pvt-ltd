"use client";

import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  alt: string;
}

export function ImagePreviewDialog({ open, onOpenChange, src, alt }: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-lg items-center justify-center p-2">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {src && (
          // Plain <img>, not next/image: this is a user-supplied remote URL of
          // unknown origin — piping it through the Next image optimizer would
          // require allowlisting arbitrary domains, same tradeoff as Avatar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="max-h-[75vh] w-full rounded-lg object-contain" />
        )}
      </DialogContent>
    </Dialog>
  );
}
