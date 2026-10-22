import { toast, Toaster } from "sonner";

/**
 * The one Toaster of the app, mounted in the root route. Toasts are headless (`toast.custom`) so
 * they wear the world's capsule; Sonner keeps the stacking, the timing and the swipe.
 */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      theme="system"
      gap={8}
      visibleToasts={3}
      offset={{ bottom: "1.5rem" }}
      mobileOffset={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    />
  );
}

interface ToastAction {
  label: string;
  onClick: () => void;
}

function ToastCapsule({ message, action }: { message: string; action?: ToastAction }) {
  return (
    <div className="toast-capsule" data-action={action !== undefined}>
      <span className="toast-message">{message}</span>
      {action === undefined ? null : (
        <button type="button" className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/** A plain message, such as "Habit deleted" without an undo. */
export function toastMessage(message: string): string | number {
  return toast.custom(() => <ToastCapsule message={message} />, { duration: 4000 });
}

/** A message with "Undo": after a paint, a delete and other bulk changes. */
export function toastUndo(message: string, onUndo: () => void): string | number {
  return toast.custom(
    (id) => (
      <ToastCapsule
        message={message}
        action={{
          label: "Undo",
          onClick: () => {
            toast.dismiss(id);
            onUndo();
          },
        }}
      />
    ),
    { duration: 6000 },
  );
}

/**
 * "Couldn't save" with "Retry", after a write failed and the screen rolled back. One at a time: a
 * second failure replaces the first toast instead of stacking.
 */
export function toastSaveError(onRetry: () => void): string | number {
  return toast.custom(
    (id) => (
      <ToastCapsule
        message="Couldn't save"
        action={{
          label: "Retry",
          onClick: () => {
            toast.dismiss(id);
            onRetry();
          },
        }}
      />
    ),
    { id: "save-error", duration: 8000 },
  );
}

export function dismissToast(id: string | number): void {
  toast.dismiss(id);
}
