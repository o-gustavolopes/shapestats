import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles";

export default function ConfirmModal({ visible, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <View style={styles.modalBackdrop}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalText}>{message}</Text>
        <View style={styles.modalActions}>
          <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#999" }]} onPress={onCancel}>
            <Text style={styles.modalBtnText}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#e74c3c" }]} onPress={onConfirm}>
            <Text style={styles.modalBtnText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
