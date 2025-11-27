import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const cadastrar = async () => {
    setErro("");

    try {
      const emailLimpo = email.trim().toLowerCase();

      if (!emailLimpo) {
        setErro("Digite um e-mail.");
        return;
      }

      if (!senha || senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      const methods = await fetchSignInMethodsForEmail(auth, emailLimpo);
      if (methods.length > 0) {
        setErro("Este e-mail já está cadastrado.");
        return;
      }

      await createUserWithEmailAndPassword(auth, emailLimpo, senha);

    } catch (e) {
      console.log(e.code);

      if (e.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está cadastrado.");
      } else if (e.code === "auth/invalid-email") {
        setErro("E-mail inválido.");
      } else {
        setErro("Erro ao criar conta. Tente novamente.");
      }
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Criar Conta</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
      />

      {erro ? (
        <Text style={{ color: "red", marginTop: 4 }}>{erro}</Text>
      ) : null}

      <TouchableOpacity
        onPress={cadastrar}
        style={{
          backgroundColor: "#2e86de",
          padding: 14,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Cadastrar
        </Text>
      </TouchableOpacity>

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
