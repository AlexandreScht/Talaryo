'use client';

import { getErrorMessage } from '@/exceptions/errorMessage';
import { toastProps } from '@/interfaces/notifications';

import { toast } from 'sonner';

export const ErrorToast = ({ text, error, time, pos, closeButton, icon, action, dismissible = true, atCancel, onClose }: toastProps) => {
  try {
    const msg = text ? text : getErrorMessage(error).err;

    return toast.error(msg, {
      duration: time || 3000,
      position: pos || 'bottom-left',
      closeButton,
      icon,
      action,
      dismissible,
      onDismiss: atCancel,
      onAutoClose: onClose,
      style: {},
      classNames: {
        error: '!bg-errorBg/80 !rounded-lg border-1 border-errorTxt/40',
        title: '!text-foreground/90 text-p3 font-medium',
        icon: '!text-foreground/90 lg:mr-3.5',
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const SuccessToast = ({ text, time, pos, closeButton, icon, action, atCancel, onClose }: Omit<toastProps, 'error'>) => {
  return toast.success(text, {
    duration: time || 3000,
    position: pos || 'bottom-left',
    closeButton,
    icon,
    action,
    onDismiss: atCancel,
    onAutoClose: onClose,
    classNames: {
      success: '!bg-validBg/90 !rounded-lg border-1 border-validTxt/40',
      title: '!text-foreground text-p3 font-medium',
      icon: '!text-foreground lg:mr-3.5',
    },
  });
};

export const InfoToast = ({ text, time, pos, closeButton, icon, action, atCancel, onClose }: Omit<toastProps, 'error'>) => {
  return toast.info(text, {
    duration: time || 3000,
    position: pos || 'bottom-left',
    closeButton,
    icon,
    action,
    onDismiss: atCancel,
    onAutoClose: onClose,
    className: 'bg-red-500',
    classNames: {
      info: '!bg-content/90 !rounded-lg border-1 border-foreground/20',
      title: '!text-foreground text-p3 font-medium',
      icon: '!text-foreground lg:mr-3.5',
    },
  });
};
