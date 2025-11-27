import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const login = async () => {
    setErro("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);

      navigation.replace("AppTabs");
      
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
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: "#fff",
          padding: 12,
          marginVertical: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          marginVertical: 10,
          borderRadius: 8,
        }}
      />

      {erro ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{erro}</Text>
      ) : null}

      <TouchableOpacity
        onPress={login}
        style={{
          backgroundColor: "#2e86de",
          padding: 14,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Entrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Cadastro")}
        style={{ marginTop: 20, alignSelf: "center" }}
      >
        <Text style={{ color: "#2e86de" }}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}
