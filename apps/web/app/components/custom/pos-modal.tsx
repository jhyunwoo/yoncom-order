import * as Dialog from "~/components/ui/dialog";
import { useModal } from "~/hooks/use-modal";
import { cn } from "~/lib/utils";

export default function PosModal({
  modalHook,
  className,
  children,
}: {
  modalHook: ReturnType<typeof useModal>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Dialog open={modalHook.openState} onOpenChange={modalHook.toggle}>
      <Dialog.DialogContent className={cn("fc min-w-fit min-h-[25rem] max-h-[40rem] justify-between rounded-xl", className)}>
        {children}
      </Dialog.DialogContent>
    </Dialog.Dialog >
  )
}
