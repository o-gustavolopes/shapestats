import { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCollectionOrdered, getSingleDoc } from "../utils/firestoreUtils";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../styles";

export default function HomeScreen({ navigation }) {
  const [pesos, setPesos] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [perfil, setPerfil] = useState({ nome: "", idade: "", altura: "", metaPeso: "" });

  const { height } = useWindowDimensions();
  const bottomPadding = Math.max(24, Math.min(80, Math.round(height * 0.06)));
  const spacerHeight = Math.max(16, Math.min(56, Math.round(height * 0.035)));

  const carregar = async () => {
  const pesosDB = await getCollectionOrdered("pesos");
  setPesos(pesosDB ?? []);

  const medDB = await getCollectionOrdered("medidas");
  setMedidas(medDB ?? []);

  const uid = auth.currentUser?.uid;
  const perfilDB = await getSingleDoc("perfil", uid);

setPerfil(
  perfilDB
    ? {
        ...perfilDB,
        metaPeso: perfilDB.metaPeso ? Number(perfilDB.metaPeso) : null,
        altura: perfilDB.altura ? Number(perfilDB.altura) : null,
        idade: perfilDB.idade ? Number(perfilDB.idade) : null,
      }
    : { nome: "", idade: null, altura: null, metaPeso: null }
);
};

  useFocusEffect(useCallback(() => { carregar(); }, []));

  const lastPeso  = pesos.length ? Number(pesos[0].valor) : null;
  const startPeso = pesos.length ? Number(pesos[pesos.length - 1].valor) : null;
  const metaPeso  = perfil?.metaPeso ? Number(perfil.metaPeso) : null;
  const alturaM   = perfil?.altura ? Number(perfil.altura) / 100 : null;
  const imc       = (lastPeso && alturaM) ? (lastPeso / (alturaM * alturaM)) : null;

  const hasAll = lastPeso != null && startPeso != null && metaPeso != null;
  const raw = hasAll ? (lastPeso - startPeso) / (metaPeso - startPeso) : 0;
  const progress = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0;


    console.log("RENDER >> progress:", progress, "lastPeso:", lastPeso, "startPeso:", startPeso, "metaPeso:", metaPeso);

  useEffect(() => {
  console.log({
    lastPeso,
    startPeso,
    metaPeso,
    hasAll,
    progressRaw: (lastPeso - startPeso) / (metaPeso - startPeso)
  });
}, [lastPeso, startPeso, metaPeso]);
  

  const reached = hasAll
    ? ((metaPeso < startPeso && lastPeso <= metaPeso) || (metaPeso > startPeso && lastPeso >= metaPeso))
    : false;
  const remainingAbs = hasAll ? Math.abs(metaPeso - lastPeso) : null;

  const resumoMedidas = medidas.length ? medidas[0] : null;
  const formatKg = (v) => (v == null ? "-" : `${Number(v).toFixed(1)} kg`);
  const formatCm = (v) => (v ? `${Number(v).toFixed(1)} cm` : "-");
  const delta = (lastPeso != null && startPeso != null) ? (lastPeso - startPeso) : null;

  const imcCategoria = (val) => {
    if (!val) return "-";
    if (val < 18.5) return "Abaixo do peso";
    if (val < 25)   return "Normal";
    if (val < 30)   return "Sobrepeso";
    return "Obesidade";
  };

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 12,
        backgroundColor: "#f8f9fa",
        paddingBottom: bottomPadding,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>ShapeStats</Text>
      <Text style={styles.greeting}>
        {perfil?.nome ? `Olá, ${perfil.nome}!` : "Defina seu perfil para personalizar o app."}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo do Peso</Text>
        <View style={styles.rowBetween}>
          <View style={styles.col}>
            <Text style={styles.label}>Peso atual</Text>
            <Text style={styles.value}>{formatKg(lastPeso)}</Text>
            <Text style={styles.hint}>
              {pesos[0]?.data ? `Atualizado em ${pesos[0].data}` : "Sem registros"}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Meta</Text>
            <Text style={styles.value}>{metaPeso != null ? formatKg(metaPeso) : "-"}</Text>
            <Text style={styles.hint}>
              {hasAll
                ? (remainingAbs === 0
                    ? "Meta atingida! 🎯"
                    : (reached
                        ? `Ultrapassou ${remainingAbs.toFixed(1)} kg`
                        : `Faltam ${remainingAbs.toFixed(1)} kg`))
                : "Defina meta no Perfil"}
            </Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.hint}>
          {hasAll && !isNaN(progress)
            ? `${Math.round(progress * 100)}% do caminho até a meta`
            : "Registre peso e meta para ver o progresso"}  
        </Text>

        <Text
          style={[
            styles.delta,
            { color: delta != null ? (delta <= 0 ? "#2ecc71" : "#e67e22") : "#999" },
          ]}
        >
          {delta != null
            ? `Desde o início: ${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`
            : "Sem histórico suficiente"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>IMC</Text>
        <Text style={styles.value}>{imc ? imc.toFixed(1) : "-"}</Text>
        <Text style={styles.hint}>
          {imc ? imcCategoria(imc) : "Informe altura no Perfil e registre um peso"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimas Medidas</Text>
        {resumoMedidas ? (
          <>
            <Text style={styles.hint}>Atualizado em {resumoMedidas.data}</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.labelSm}>Cintura</Text>
                <Text style={styles.valueSm}>{formatCm(resumoMedidas.cintura)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.labelSm}>Peito</Text>
                <Text style={styles.valueSm}>{formatCm(resumoMedidas.peito)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.labelSm}>Braço</Text>
                <Text style={styles.valueSm}>{formatCm(resumoMedidas.braco)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.labelSm}>Coxa</Text>
                <Text style={styles.valueSm}>{formatCm(resumoMedidas.coxa)}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.hint}>Sem medidas registradas.</Text>
        )}
      </View>

      <View style={{ height: spacerHeight }} />
    </ScrollView>
  </SafeAreaView>
);
}
