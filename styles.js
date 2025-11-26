import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 16 },

  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6, color: "#222" },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 18, marginBottom: 8, color: "#333" },
  text: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 10 },
  greeting: { fontSize: 16, color: "#555", marginBottom: 4 },

  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, marginBottom: 10, backgroundColor: "#fff" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#222" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  col: { flex: 1 },

  label: { fontSize: 13, color: "#777" },
  value: { fontSize: 22, fontWeight: "700", color: "#111", marginTop: 2 },
  hint: { fontSize: 12, color: "#777", marginTop: 4 },
  delta: { fontSize: 14, fontWeight: "600", marginTop: 8 },

  progressWrap: { width: "100%", height: 10, backgroundColor: "#eee", borderRadius: 999, overflow: "hidden", marginTop: 8 },
  progressBar: { height: "100%", backgroundColor: "#4CAF50" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  gridItem: { width: "48%", backgroundColor: "#f7f7f7", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#eee" },
  labelSm: { fontSize: 12, color: "#777" },
  valueSm: { fontSize: 16, fontWeight: "700", color: "#111", marginTop: 2 },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  actionBtn: { flex: 1, backgroundColor: "#2e86de", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700" },

  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

  item: { backgroundColor: "#f1f1f1", padding: 10, borderRadius: 8, marginVertical: 5 },
  itemText: { fontSize: 15, color: "#222" },

  profileCard: { marginTop: 16, backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee" },
  profileText: { fontSize: 15, color: "#333", marginVertical: 2 },

  modalBackdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
  },
  modalBox: { width: "85%", backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#eee" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#222" },
  modalText: { fontSize: 14, color: "#444", marginBottom: 16 },
  modalActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  modalBtnText: { color: "#fff", fontWeight: "700" },
  saveBtn: {
  backgroundColor: "#2e86de",
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center",
  alignSelf: "center",
  width: "60%",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

});
