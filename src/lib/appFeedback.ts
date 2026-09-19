export type ToastTone = "success" | "error" | "info";

export interface AppDialogAction {
  label: string;
  tone?: "default" | "destructive";
  onPress?: () => void | Promise<void>;
}

export interface AppDialogOptions {
  title: string;
  description?: string;
  actions?: AppDialogAction[];
}

type FeedbackHandlers = {
  showToast: (message: string, tone: ToastTone) => void;
  showDialog: (options: AppDialogOptions) => void;
};

let handlers: FeedbackHandlers | null = null;

export const registerAppFeedbackHandlers = (nextHandlers: FeedbackHandlers) => {
  handlers = nextHandlers;

  return () => {
    handlers = null;
  };
};

export const showToast = (message: string, tone: ToastTone = "info") => {
  handlers?.showToast(message, tone);
};

export const showDialog = (options: AppDialogOptions) => {
  handlers?.showDialog(options);
};
