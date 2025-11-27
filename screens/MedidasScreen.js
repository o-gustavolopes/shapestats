import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
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

// ---------------------------
// MÁSCARA DE DATA (DD/MM/YYYY)
// ---------------------------
const maskDate = (value) => {
  console.log("[DEBUG][maskDate][medidas] entrada:", value);
  if (!value) return "";
  const onlyNums = value.replace(/\D/g, "").slice(0, 8);
  if (onlyNums.length <= 2) {
    console.log("[DEBUG][maskDate][medidas] resultado:", onlyNums);
    return onlyNums;
  }
  if (onlyNums.length <= 4) {
    const res = onlyNums.slice(0, 2) + "/" + onlyNums.slice(2);
    console.log("[DEBUG][maskDate][medidas] resultado:", res);
    return res;
  }
  const res = onlyNums.slice(0, 2) + "/" + onlyNums.slice(2, 4) + "/" + onlyNums.slice(4);
  console.log("[DEBUG][maskDate][medidas] resultado:", res);
  return res;
};

const isValidDateString = (str) => {
  console.log("[DEBUG][isValidDateString] checando:", str);

  if (!str || str.length !== 10) return false;

  const [dd, mm, yyyy] = str.split("/");

  if (!/^\d{2}$/.test(dd) || !/^\d{2}$/.test(mm) || !/^\d{4}$/.test(yyyy)) {
    console.log("[DEBUG][isValidDateString] falso: regex");
    return false;
  }

  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  const d = new Date(`${yyyy}/${mm}/${dd}`);

  const ok =
    d.getFullYear() === year &&
    d.getMonth() + 1 === month &&
    d.getDate() === day;

  console.log("[DEBUG][isValidDateString] resultado final:", ok);
  return ok;
};

const todayPtBr = () => new Date().toLocaleDateString("pt-BR");

export default function MedidasScreen() {
  const [cintura, setCintura] = React.useState("");
  const [peito, setPeito] = React.useState("");
  const [braco, setBraco] = React.useState("");
  const [coxa, setCoxa] = React.useState("");
  const [data, setData] = React.useState("");

  const [registros, setRegistros] = React.useState([]);
  const [editingId, setEditingId] = React.useState(null);

  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState(null);
  const [targetId, setTargetId] = React.useState(null);

  const medidasRef = collection(db, "medidas");

  const recarregarLista = async () => {
    try {
      const uid = auth.currentUser?.uid;
      console.log("[DEBUG][recarregarLista] uid:", uid);
      if (!uid) return;
      const q = query(medidasRef, where("uid", "==", uid), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("[DEBUG][recarregarLista] encontrados:", lista.length);
      setRegistros(lista);
    } catch (err) {
      console.log("[ERROR][recarregarLista]", err);
    }
  };

  React.useEffect(() => {
    recarregarLista();
  }, []);

  const toNum = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  const salvarMedidas = async () => {
    const uid = auth.currentUser?.uid;
    console.log("[DEBUG][salvarMedidas] called with:", { uid, cintura, peito, braco, coxa, data, editingId });
    if (!uid) {
      Alert.alert("Erro", "Usuário não encontrado.");
      console.log("[DEBUG][salvarMedidas] abortando: sem uid");
      return;
    }

    // se vazio -> hoje
    if (!data || data.trim() === "") {
      console.log("[DEBUG][salvarMedidas] data vazia -> usando hoje");
      await saveToFirestoreMedidas(uid, todayPtBr());
      return;
    }

    // se preenchido, exige formato válido
    const valid = isValidDateString(data);
    console.log("[DEBUG][salvarMedidas] isValidDateString retornou:", valid);
    if (!valid) {
      Alert.alert("Data inválida", "A data informada não está no formato DD/MM/YYYY ou é inválida. Corrija para salvar.");
      console.log("[DEBUG][salvarMedidas] abortando: data inválida:", data);
      return;
    }

    await saveToFirestoreMedidas(uid, data);
  };

  const saveToFirestoreMedidas = async (uid, dataToSave) => {
    const reg = {
      uid,
      data: dataToSave,
      cintura: toNum(cintura),
      peito: toNum(peito),
      braco: toNum(braco),
      coxa: toNum(coxa),
    };

    try {
      console.log("[DEBUG][saveToFirestoreMedidas] payload:", { reg, editingId });
      if (editingId) {
        console.log("[DEBUG][saveToFirestoreMedidas] fazendo update:", editingId);
        await updateDoc(doc(db, "medidas", editingId), reg);
        console.log("[DEBUG][saveToFirestoreMedidas] update ok");
        setEditingId(null);
      } else {
        console.log("[DEBUG][saveToFirestoreMedidas] criando novo doc");
        const ref = await addDoc(medidasRef, { ...reg, createdAt: serverTimestamp() });
        console.log("[DEBUG][saveToFirestoreMedidas] criado id:", ref.id);
      }
      limparCampos();
      await recarregarLista();
    } catch (err) {
      console.log("[ERROR][saveToFirestoreMedidas]", err);
      Alert.alert("Erro", "Não foi possível salvar. Veja o console para mais detalhes.");
    }
  };

  const limparCampos = () => {
    console.log("[DEBUG][limparCampos]");
    setCintura("");
    setPeito("");
    setBraco("");
    setCoxa("");
    setData("");
    setEditingId(null);
  };

  const iniciarEdicao = (item) => {
    console.log("[DEBUG][iniciarEdicao][medidas] item:", item);
    setEditingId(item.id);
    setCintura(String(item.cintura ?? ""));
    setPeito(String(item.peito ?? ""));
    setBraco(String(item.braco ?? ""));
    setCoxa(String(item.coxa ?? ""));
    setData(typeof item.data === "string" ? item.data : "");
  };

  const pedirConfirmacaoLimpar = () => {
    console.log("[DEBUG][pedirConfirmacaoLimpar] registros:", registros.length);
    if (!registros.length) return;
    setConfirmType("limpar");
    setTargetId(null);
    setConfirmVisible(true);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>📏 Registrar Medidas</Text>

      <TextInput
        style={styles.input}
        placeholder="Data (DD/MM/YYYY)"
        keyboardType="numeric"
        value={data}
        onChangeText={(t) => {
          console.log("[DEBUG][input][data][medidas] raw:", t);
          const m = maskDate(t);
          console.log("[DEBUG][input][data][medidas] masked:", m);
          setData(m);
        }}
      />

      <TextInput style={styles.input} placeholder="Cintura (cm)" keyboardType="numeric" value={cintura} onChangeText={(t) => { console.log("[DEBUG][input][cintura]", t); setCintura(t); }} />
      <TextInput style={styles.input} placeholder="Peito (cm)" keyboardType="numeric" value={peito} onChangeText={(t) => { console.log("[DEBUG][input][peito]", t); setPeito(t); }} />
      <TextInput style={styles.input} placeholder="Braço (cm)" keyboardType="numeric" value={braco} onChangeText={(t) => { console.log("[DEBUG][input][braco]", t); setBraco(t); }} />
      <TextInput style={styles.input} placeholder="Coxa (cm)" keyboardType="numeric" value={coxa} onChangeText={(t) => { console.log("[DEBUG][input][coxa]", t); setCoxa(t); }} />

      <View style={{ flexDirection: "row", marginBottom: 16, justifyContent: "space-between" }}>
        <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: "#2e86de" }]} onPress={salvarMedidas}>
          <Text style={styles.actionText}>{editingId ? "Atualizar" : "Salvar"}</Text>
        </TouchableOpacity>

        {editingId ? (
          <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: "#999" }]} onPress={limparCampos}>
            <Text style={styles.actionText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: "#e74c3c" }]} onPress={pedirConfirmacaoLimpar}>
            <Text style={styles.actionText}>Limpar histórico</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Histórico</Text>

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={styles.itemText}>
              {item.data} — Cint: {item.cintura} | Peito: {item.peito} | Braço: {item.braco} | Coxa: {item.coxa}
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => iniciarEdicao(item)}>
                <Text style={{ color: "#2e86de", fontWeight: "600" }}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  console.log("[DEBUG][pedirExcluir] id:", item.id);
                  setConfirmType("excluir");
                  setTargetId(item.id);
                  setConfirmVisible(true);
                }}
              >
                <Text style={{ color: "#e74c3c", fontWeight: "600" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={confirmVisible}
        title={confirmType === "excluir" ? "Excluir medida" : "Limpar histórico"}
        message={confirmType === "excluir" ? "Deseja excluir esta medida?" : "Deseja apagar TODAS as medidas?"}
        confirmText={confirmType === "excluir" ? "Excluir" : "Limpar"}
        cancelText="Cancelar"
        onConfirm={async () => {
          try {
            console.log("[DEBUG][ConfirmModal][medidas] onConfirm tipo:", confirmType);
            if (confirmType === "excluir") {
              await deleteDoc(doc(db, "medidas", targetId));
              console.log("[DEBUG][ConfirmModal][medidas] excluído id:", targetId);
            } else {
              const uid = auth.currentUser?.uid;
              const snap = await getDocs(query(medidasRef, where("uid", "==", uid)));
              console.log("[DEBUG][ConfirmModal][medidas] deletando em massa:", snap.docs.length);
              const deletions = snap.docs.map((d) => deleteDoc(d.ref));
              await Promise.all(deletions);
            }
            setConfirmVisible(false);
            setConfirmType(null);
            setTargetId(null);
            await recarregarLista();
          } catch (err) {
            console.log("[ERROR][ConfirmModal][medidas] erro ao deletar:", err);
            Alert.alert("Erro", "Falha ao apagar registros. Veja o console.");
          }
        }}
        onCancel={() => {
          console.log("[DEBUG][ConfirmModal][medidas] onCancel");
          setConfirmVisible(false);
        }}
      />
    </View>
  );
}
