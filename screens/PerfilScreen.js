import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import styles from "../styles";

export default function PerfilScreen() {
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [altura, setAltura] = React.useState("");
  const [metaPeso, setMetaPeso] = React.useState("");

  const PERFIL_ID = "perfilUsuario";

  React.useEffect(() => {
    const carregar = async () => {
      try {
        const ref = doc(db, "perfil", PERFIL_ID);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const p = snap.data();
          setNome(p.nome || "");
          setIdade(p.idade || "");
          setAltura(p.altura || "");
          setMetaPeso(p.metaPeso || "");
        }
      } catch (e) {
        console.log("Erro ao carregar perfil:", e);
      }
    };
    carregar();
  }, []);

  const salvarPerfil = async () => {
    try {
      const ref = doc(db, "perfil", PERFIL_ID);

      await setDoc(ref, {
        nome,
        idade,
        altura,
        metaPeso,
      });

      console.log("Perfil salvo no Firestore!");
    } catch (e) {
      console.log("Erro ao salvar perfil:", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>👤 Perfil</Text>
      <Text style={styles.text}>
        Preencha seus dados. Eles serão usados para cálculos e personalização do app.
      </Text>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Marcelo"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Idade</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 29"
          keyboardType="numeric"
          value={idade}
          onChangeText={setIdade}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 175"
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Meta de peso (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 78.5"
          keyboardType="numeric"
          value={metaPeso}
          onChangeText={setMetaPeso}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={salvarPerfil}>
        <Text style={styles.saveBtnText}>Salvar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
