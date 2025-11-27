import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import styles from "../styles";

export default function PerfilScreen({ navigation }) {
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [altura, setAltura] = React.useState("");
  const [metaPeso, setMetaPeso] = React.useState("");

  const uid = auth.currentUser?.uid;

  React.useEffect(() => {
    if (!uid) return;

    const carregar = async () => {
      try {
        const ref = doc(db, "perfil", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const p = snap.data();
          setNome(p.nome || "");
          setIdade(String(p.idade || ""));
          setAltura(String(p.altura || ""));
          setMetaPeso(String(p.metaPeso || ""));
        }
      } catch (e) {
        console.log("Erro ao carregar perfil:", e);
      }
    };

    carregar();
  }, [uid]);

  const salvarPerfil = async () => {
    if (!uid) return;

    const idadeN = Number(idade);
    const alturaN = Number(altura);
    const metaPesoN = Number(metaPeso);

    if (!nome.trim()) return console.log("Nome inválido");
    if (isNaN(idadeN)) return console.log("Idade inválida");
    if (isNaN(alturaN)) return console.log("Altura inválida");
    if (isNaN(metaPesoN)) return console.log("Meta de peso inválida");

    try {
      const ref = doc(db, "perfil", uid);

      await setDoc(ref, {
        uid,
        nome,
        idade: idadeN,
        altura: alturaN,
        metaPeso: metaPesoN,
        updatedAt: serverTimestamp(),
      });

      console.log("Perfil salvo!");
    } catch (e) {
      console.log("Erro ao salvar perfil:", e);
    }
  };

  const sair = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (e) {
      console.log("Erro ao sair:", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>👤 Perfil</Text>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Idade</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={idade}
          onChangeText={setIdade}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Meta de Peso (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={metaPeso}
          onChangeText={setMetaPeso}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={salvarPerfil}>
        <Text style={styles.saveBtnText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#e74c3c", marginTop: 15 }]}
        onPress={sair}
      >
        <Text style={[styles.saveBtnText, { color: "white" }]}>
          Sair da conta
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
