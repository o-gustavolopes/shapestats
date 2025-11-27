import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const cadastrar = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = cred.user.uid;

      navigation.replace("PerfilInicial", { uid });

    } catch (e) {
      console.log(e);
      setErro("Erro ao cadastrar");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Criar conta</Text>

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

      <TouchableOpacity
        onPress={cadastrar}
        style={{
          backgroundColor: "#2e86de",
          padding: 14,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Criar Conta
        </Text>
      </TouchableOpacity>

      {/* BOTÃO: Já tenho conta */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "#2e86de", textAlign: "center" }}>
           Já tem uma conta? Voltar ao login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
