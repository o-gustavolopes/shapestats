import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import styles from "../styles";
import ConfirmModal from "../components/ConfirmModal";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

export default function MedidasScreen() {
  const [cintura, setCintura] = React.useState("");
  const [peito, setPeito] = React.useState("");
  const [braco, setBraco] = React.useState("");
  const [coxa, setCoxa] = React.useState("");
  const [registros, setRegistros] = React.useState([]);
  const [editingId, setEditingId] = React.useState(null);

  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState(null);
  const [targetId, setTargetId] = React.useState(null);

  const medidasRef = collection(db, "medidas");

  React.useEffect(() => {
    recarregarLista();
  }, []);

  const recarregarLista = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const q = query(
        medidasRef,
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setRegistros(lista);
    } catch (err) {
      console.log("Erro ao carregar medidas:", err);
    }
  };

  const toNum = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  const salvarMedidas = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const reg = {
      uid,
      cintura: toNum(cintura),
      peito: toNum(peito),
      braco: toNum(braco),
      coxa: toNum(coxa),
    };

    try {
      if (editingId) {
        const ref = doc(db, "medidas", editingId);
        await updateDoc(ref, reg);
        setEditingId(null);
      } else {
        await addDoc(medidasRef, {
          ...reg,
          data: new Date().toLocaleDateString("pt-BR"),
          createdAt: serverTimestamp(),
        });
      }

      limparCampos();
      recarregarLista();
    } catch (err) {
      console.log("Erro ao salvar medidas:", err);
    }
  };

  const limparCampos = () => {
    setCintura("");
    setPeito("");
    setBraco("");
    setCoxa("");
  };

  const iniciarEdicao = (item) => {
    setEditingId(item.id);
    setCintura(String(item.cintura || ""));
    setPeito(String(item.peito || ""));
    setBraco(String(item.braco || ""));
    setCoxa(String(item.coxa || ""));
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    limparCampos();
  };

  const pedirConfirmacaoExcluir = (id) => {
    setConfirmType("excluir");
    setTargetId(id);
    setConfirmVisible(true);
  };

  const pedirConfirmacaoLimpar = () => {
    if (registros.length) {
      setConfirmType("limpar");
      setTargetId(null);
      setConfirmVisible(true);
    }
  };

  const confirmarAcao = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      if (confirmType === "excluir" && targetId) {
        const ref = doc(db, "medidas", targetId);
        await deleteDoc(ref);

        if (editingId === targetId) cancelarEdicao();
      }

      if (confirmType === "limpar") {
        const q = query(medidasRef, where("uid", "==", uid));
        const snap = await getDocs(q);

        const promises = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(promises);

        cancelarEdicao();
      }

      setConfirmVisible(false);
      setConfirmType(null);
      setTargetId(null);
      recarregarLista();
    } catch (err) {
      console.log("Erro ao excluir/limpar:", err);
    }
  };

  const cancelarAcao = () => {
    setConfirmVisible(false);
    setConfirmType(null);
    setTargetId(null);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>📏 Registrar Medidas</Text>

      <TextInput
        style={styles.input}
        placeholder="Cintura (cm)"
        keyboardType="numeric"
        value={cintura}
        onChangeText={setCintura}
      />
      <TextInput
        style={styles.input}
        placeholder="Peito (cm)"
        keyboardType="numeric"
        value={peito}
        onChangeText={setPeito}
      />
      <TextInput
        style={styles.input}
        placeholder="Braço (cm)"
        keyboardType="numeric"
        value={braco}
        onChangeText={setBraco}
      />
      <TextInput
        style={styles.input}
        placeholder="Coxa (cm)"
        keyboardType="numeric"
        value={coxa}
        onChangeText={setCoxa}
      />

      <View
        style={[
          styles.buttonRow,
          { justifyContent: "space-between", marginBottom: 16 },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionBtn, { flex: 1, backgroundColor: "#2e86de" }]}
          onPress={salvarMedidas}
        >
          <Text style={styles.actionText}>
            {editingId ? "Atualizar" : "Salvar"}
          </Text>
        </TouchableOpacity>

        {editingId ? (
          <TouchableOpacity
            style={[styles.actionBtn, { flex: 1, backgroundColor: "#999" }]}
            onPress={cancelarEdicao}
          >
            <Text style={styles.actionText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { flex: 1, backgroundColor: "#e74c3c" }]}
            onPress={pedirConfirmacaoLimpar}
          >
            <Text style={styles.actionText}>Limpar histórico</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Histórico</Text>

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <Text style={styles.itemText}>
              {item.data} — Cint: {item.cintura} | Peito: {item.peito} | Braço:{" "}
              {item.braco} | Coxa: {item.coxa} cm
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => iniciarEdicao(item)}>
                <Text style={{ color: "#2e86de", fontWeight: "600" }}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pedirConfirmacaoExcluir(item.id)}
              >
                <Text style={{ color: "#e74c3c", fontWeight: "600" }}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={confirmVisible}
        title={confirmType === "excluir" ? "Excluir medida" : "Limpar histórico"}
        message={
          confirmType === "excluir"
            ? "Tem certeza que deseja excluir este registro de medidas?"
            : "Tem certeza que deseja apagar todas as medidas?"
        }
        confirmText={confirmType === "excluir" ? "Excluir" : "Limpar"}
        cancelText="Cancelar"
        onConfirm={confirmarAcao}
        onCancel={cancelarAcao}
      />
    </View>
  );
}
