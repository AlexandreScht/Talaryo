import type { Action, Position, ToastT } from 'sonner';

interface toastProps {
  text?: string;
  error?: unknown;
  time?: number;
  pos?: Position;
  dismissible?: boolean;
  closeButton?: Action | React.ReactNode;
  icon?: React.ReactNode;
  action?: Action | React.ReactNode;
  atCancel?: (toast?: ToastT) => void;
  onClose?: (toast?: ToastT) => void;
}
