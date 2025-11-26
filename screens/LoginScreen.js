import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (e) {
      setErro("Email ou senha inválidos");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Entrar</Text>

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

      {erro ? <Text style={{ color: "red" }}>{erro}</Text> : null}

      <TouchableOpacity onPress={login} style={{ backgroundColor: "#2e86de", padding: 14, borderRadius: 8 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Entrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Cadastro")} style={{ marginTop: 20 }}>
        <Text style={{ color: "#2e86de" }}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}
