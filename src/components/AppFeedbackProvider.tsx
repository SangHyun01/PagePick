import {
  AppDialogAction,
  AppDialogOptions,
  registerAppFeedbackHandlers,
  ToastTone,
} from "@/lib/appFeedback";
import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SIZES } from "@/constants/theme";

const TOAST_ICONS: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

interface ToastState {
  message: string;
  tone: ToastTone;
}

export default function AppFeedbackProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dialog, setDialog] = useState<AppDialogOptions | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unregister = registerAppFeedbackHandlers({
      showToast: (message, tone) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setToast({ message, tone });
        timeoutRef.current = setTimeout(() => setToast(null), 2800);
      },
      showDialog: (options) => setDialog(options),
    });

    return () => {
      unregister();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDialogAction = async (action: AppDialogAction) => {
    setDialog(null);
    await action.onPress?.();
  };

  const actions = dialog?.actions?.length
    ? dialog.actions
    : [{ label: "확인" }];

  return (
    <>
      {children}
      {toast && (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={[styles.toast, styles[`toast_${toast.tone}`]]}>
            <Ionicons name={TOAST_ICONS[toast.tone]} size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}
      <Modal
        visible={Boolean(dialog)}
        transparent
        animationType="fade"
        onRequestClose={() => setDialog(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialogCard}>
            <TouchableOpacity
              style={styles.dialogClose}
              onPress={() => setDialog(null)}
              accessibilityLabel="모달 닫기"
            >
              <Ionicons name="close" size={22} color="#64736A" />
            </TouchableOpacity>
            <Text style={styles.dialogTitle}>{dialog?.title}</Text>
            {dialog?.description && (
              <Text style={styles.dialogDescription}>{dialog.description}</Text>
            )}
            <View style={[styles.actions, actions.length > 2 && styles.actionsStacked]}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.action,
                    actions.length > 2 && styles.stackedAction,
                    action.tone === "destructive"
                      ? styles.destructiveAction
                      : styles.defaultAction,
                  ]}
                  onPress={() => void handleDialogAction(action)}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.tone === "destructive"
                        ? styles.destructiveActionText
                        : styles.defaultActionText,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    top: 58,
    left: SIZES.padding,
    right: SIZES.padding,
    zIndex: 100,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 420,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 1.4,
    borderRadius: SIZES.radius * 1.25,
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toast_success: { backgroundColor: "#375A4E" },
  toast_error: { backgroundColor: "#B85F55" },
  toast_info: { backgroundColor: "#557A68" },
  toastText: {
    flexShrink: 1,
    marginLeft: SIZES.base,
    color: "#FFFFFF",
    fontSize: SIZES.body4,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.padding,
    backgroundColor: "rgba(36, 51, 45, 0.46)",
  },
  dialogCard: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    padding: SIZES.padding * 1.25,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    backgroundColor: "#FFFEFA",
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  dialogTitle: { color: "#24332D", fontSize: SIZES.h3, fontWeight: "700" },
  dialogClose: {
    position: "absolute",
    top: SIZES.base,
    right: SIZES.base,
    padding: SIZES.base,
  },
  dialogDescription: {
    color: "#78857E",
    fontSize: SIZES.body4 - 1,
    lineHeight: SIZES.body4 * 1.55,
    textAlign: "center",
    marginTop: SIZES.base,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    gap: SIZES.base,
    marginTop: SIZES.padding,
  },
  actionsStacked: { flexDirection: "column" },
  stackedAction: { flex: 0, alignSelf: "stretch" },
  action: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SIZES.padding * 0.6,
    borderRadius: SIZES.radius,
  },
  defaultAction: { backgroundColor: "#F2F5F1", borderWidth: 1, borderColor: "#DCE5DD" },
  destructiveAction: { backgroundColor: "#B85F55" },
  actionText: { fontSize: SIZES.body3, fontWeight: "700" },
  defaultActionText: { color: "#405148" },
  destructiveActionText: { color: "#FFFFFF" },
});
