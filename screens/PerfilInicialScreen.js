import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function PerfilInicialScreen({ navigation, route }) {
    const { uid } = route.params;

    const [nome, setNome] = useState("");
    const [idade, setIdade] = useState("");
    const [altura, setAltura] = useState("");
    const [metaPeso, setMetaPeso] = useState("");

    const entrarNoApp = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: "AppTabs" }], // volta para o root -> AppTabs
        });
    };


    const salvar = async () => {
        try {
            await setDoc(doc(db, "perfil", uid), {
                uid,
                nome,
                idade: Number(idade),
                altura: Number(altura),
                metaPeso: Number(metaPeso),
                createdAt: new Date(),
            });

            entrarNoApp();
        } catch (e) {
            console.log("Erro ao salvar:", e);
        }
    };

    const pular = () => {
        entrarNoApp();
    };

    return (
        <View style={{ padding: 20, marginTop: 40 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                Complete seu Perfil
            </Text>
            <Text style={{ marginTop: 5, opacity: 0.6 }}>
                Você pode preencher agora ou pular.
            </Text>

            <TextInput
                placeholder="Nome"
                style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                placeholder="Idade"
                keyboardType="numeric"
                style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
                value={idade}
                onChangeText={setIdade}
            />

            <TextInput
                placeholder="Altura (cm)"
                keyboardType="numeric"
                style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
                value={altura}
                onChangeText={setAltura}
            />

            <TextInput
                placeholder="Meta peso (kg)"
                keyboardType="numeric"
                style={{ backgroundColor: "#fff", padding: 12, marginVertical: 10 }}
                value={metaPeso}
                onChangeText={setMetaPeso}
            />

            <TouchableOpacity
                onPress={salvar}
                style={{
                    backgroundColor: "#2e86de",
                    padding: 14,
                    borderRadius: 8,
                    marginTop: 20,
                }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                    Salvar
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pular} style={{ marginTop: 20 }}>
                <Text style={{ color: "#2e86de", textAlign: "center" }}>
                    Pular por enquanto
                </Text>
            </TouchableOpacity>
        </View>
    );
}