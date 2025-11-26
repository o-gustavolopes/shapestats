import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const cadastrar = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);

      await setDoc(doc(db, "perfil", cred.user.uid), {
        nome: "",
        idade: null,
        altura: null,
        metaPeso: null,
      });

    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Criar Conta</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
      />

      <TouchableOpacity onPress={cadastrar} style={{ backgroundColor: "#2e86de", padding: 14, borderRadius: 8 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Criar conta
        </Text>
      </TouchableOpacity>
    </View>
  );
}
