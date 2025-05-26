import { useCallback, useState } from "react";

export function useModal({
  onOpen,
  onClose,
}: {
  onOpen?: () => void;
  onClose?: () => void;
} = {}) {
  const [modalOpen, setModalOpen] = useState(false);

  const open = useCallback(() => {
    setModalOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setModalOpen(false);
    onClose?.();
  }, [onClose]);
  
  const toggle = useCallback(() => {
    setModalOpen((prev) => !prev);
    (modalOpen) ? onClose?.() : onOpen?.();
  }, [modalOpen, onClose, onOpen]);

  return {
    openState: modalOpen,
    open,
    close,
    toggle,
  }
}