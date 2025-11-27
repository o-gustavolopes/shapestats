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
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db, auth } from "../firebaseConfig";

// ---------------------------
// MÁSCARA DE DATA (DD/MM/YYYY)
// ---------------------------
const maskDate = (value) => {
  console.log("[DEBUG][maskDate] entrada bruta:", value);
  if (!value) return "";
  const onlyNums = value.replace(/\D/g, "").slice(0, 8);
  if (onlyNums.length <= 2) {
    console.log("[DEBUG][maskDate] resultado:", onlyNums);
    return onlyNums;
  }
  if (onlyNums.length <= 4) {
    const res = onlyNums.slice(0, 2) + "/" + onlyNums.slice(2);
    console.log("[DEBUG][maskDate] resultado:", res);
    return res;
  }
  const res = onlyNums.slice(0, 2) + "/" + onlyNums.slice(2, 4) + "/" + onlyNums.slice(4);
  console.log("[DEBUG][maskDate] resultado:", res);
  return res;
};

// ---------------------------
// VALIDAÇÃO DE DATA (EXATA)
// ---------------------------
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

  // AQUI ESTÁ A CORREÇÃO!
  // Safari / iOS / Chrome WebKit aceitam apenas "YYYY/MM/DD"
  const d = new Date(`${yyyy}/${mm}/${dd}`);

  const ok =
    d.getFullYear() === year &&
    d.getMonth() + 1 === month &&
    d.getDate() === day;

  console.log("[DEBUG][isValidDateString] resultado final:", ok);
  return ok;
};

const todayPtBr = () => new Date().toLocaleDateString("pt-BR");

export default function PesoScreen() {
  const [peso, setPeso] = React.useState("");
  const [data, setData] = React.useState("");
  const [registros, setRegistros] = React.useState([]);
  const [editingId, setEditingId] = React.useState(null);

  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState(null);
  const [targetId, setTargetId] = React.useState(null);

  const uid = auth.currentUser?.uid;
  const pesosRef = collection(db, "pesos");

  const carregarLista = async () => {
    try {
      console.log("[DEBUG][carregarLista] iniciando (uid):", uid);
      if (!uid) return;
      const q = query(pesosRef, where("uid", "==", uid), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("[DEBUG][carregarLista] obtidos registros:", lista.length);
      setRegistros(lista);
    } catch (err) {
      console.log("[ERROR][carregarLista]", err);
    }
  };

  React.useEffect(() => {
    carregarLista();
  }, [uid]);

  // SALVAR: validações mais estritas para a data
  const salvarPeso = async () => {
    console.log("[DEBUG][salvarPeso] chamado com:", { peso, data, editingId });
    const valor = parseFloat(String(peso).replace(",", "."));
    if (isNaN(valor)) {
      Alert.alert("Valor inválido", "Digite um peso válido antes de salvar.");
      console.log("[DEBUG][salvarPeso] abortando: peso inválido");
      return;
    }

    // se usuário deixou vazio -> usa hoje
    if (!data || data.trim() === "") {
      console.log("[DEBUG][salvarPeso] data vazia -> usando hoje");
      await saveToFirestore(valor, todayPtBr());
      return;
    }

    // se tiver algo digitado, exige formato válido
    const valid = isValidDateString(data);
    console.log("[DEBUG][salvarPeso] isValidDateString retornou:", valid);
    if (!valid) {
      Alert.alert(
        "Data inválida",
        "A data informada não está no formato DD/MM/YYYY ou é inválida. Corrija para salvar."
      );
      console.log("[DEBUG][salvarPeso] abortando: data inválida:", data);
      return;
    }

    // chegou até aqui: data válida
    await saveToFirestore(valor, data);
  };

  const saveToFirestore = async (valor, dataToSave) => {
    try {
      console.log("[DEBUG][saveToFirestore] payload:", { uid, valor, dataToSave, editingId });
      if (editingId) {
        console.log("[DEBUG][saveToFirestore] fazendo update:", editingId);
        await updateDoc(doc(db, "pesos", editingId), {
          valor,
          data: dataToSave,
        });
        console.log("[DEBUG][saveToFirestore] update feito com sucesso");
        setEditingId(null);
      } else {
        console.log("[DEBUG][saveToFirestore] adicionando novo documento");
        const ref = await addDoc(pesosRef, {
          uid,
          valor,
          data: dataToSave,
          createdAt: serverTimestamp(),
        });
        console.log("[DEBUG][saveToFirestore] documento criado id:", ref.id);
      }
      setPeso("");
      setData("");
      await carregarLista();
    } catch (err) {
      console.log("[ERROR][saveToFirestore]", err);
      Alert.alert("Erro", "Não foi possível salvar. Veja o console para mais detalhes.");
    }
  };

  const iniciarEdicao = (item) => {
    console.log("[DEBUG][iniciarEdicao] item:", item);
    setEditingId(item.id);
    setPeso(String(item.valor));
    setData(typeof item.data === "string" ? item.data : "");
  };

  const cancelarEdicao = () => {
    console.log("[DEBUG][cancelarEdicao]");
    setEditingId(null);
    setPeso("");
    setData("");
  };

  const pedirConfirmacaoExcluir = (id) => {
    console.log("[DEBUG][pedirConfirmacaoExcluir] id:", id);
    setConfirmType("excluir");
    setTargetId(id);
    setConfirmVisible(true);
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
      <Text style={styles.title}>⚖️ Registrar Peso</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={(t) => {
          console.log("[DEBUG][input][peso] novo valor:", t);
          setPeso(t);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Data (DD/MM/YYYY)"
        keyboardType="numeric"
        value={data}
        onChangeText={(t) => {
          console.log("[DEBUG][input][data] raw:", t);
          const m = maskDate(t);
          console.log("[DEBUG][input][data] masked:", m);
          setData(m);
        }}
      />

      <View style={[styles.buttonRow, { justifyContent: "space-between", marginBottom: 16 }]}>
        <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: "#2e86de" }]} onPress={salvarPeso}>
          <Text style={styles.actionText}>{editingId ? "Atualizar" : "Salvar"}</Text>
        </TouchableOpacity>

        {editingId ? (
          <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: "#999" }]} onPress={cancelarEdicao}>
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
            <Text style={styles.itemText}>{item.data} — {Number(item.valor).toFixed(1)} kg</Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => iniciarEdicao(item)}>
                <Text style={{ color: "#2e86de", fontWeight: "600" }}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => pedirConfirmacaoExcluir(item.id)}>
                <Text style={{ color: "#e74c3c", fontWeight: "600" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={confirmVisible}
        title={confirmType === "excluir" ? "Excluir peso" : "Limpar histórico"}
        message={confirmType === "excluir" ? "Tem certeza que deseja excluir este peso?" : "Tem certeza que deseja APAGAR TODOS os pesos?"}
        confirmText={confirmType === "excluir" ? "Excluir" : "Limpar"}
        cancelText="Cancelar"
        onConfirm={async () => {
          try {
            console.log("[DEBUG][ConfirmModal] onConfirm tipo:", confirmType);
            if (confirmType === "excluir") {
              await deleteDoc(doc(db, "pesos", targetId));
              console.log("[DEBUG][ConfirmModal] exclusão feita id:", targetId);
            } else {
              const snap = await getDocs(query(pesosRef, where("uid", "==", uid)));
              console.log("[DEBUG][ConfirmModal] deletando em massa, encontrados:", snap.docs.length);
              const deletions = snap.docs.map((d) => deleteDoc(d.ref));
              await Promise.all(deletions);
              console.log("[DEBUG][ConfirmModal] exclusões em massa finalizadas");
            }
            setConfirmVisible(false);
            setConfirmType(null);
            setTargetId(null);
            await carregarLista();
          } catch (err) {
            console.log("[ERROR][ConfirmModal] erro ao deletar:", err);
            Alert.alert("Erro", "Falha ao apagar registros. Veja o console.");
          }
        }}
        onCancel={() => {
          console.log("[DEBUG][ConfirmModal] onCancel");
          setConfirmVisible(false);
        }}
      />
    </View>
  );
}
