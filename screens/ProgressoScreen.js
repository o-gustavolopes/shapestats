import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import styles from "../styles";

import { db, auth } from "../firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;

const parsePtBrDateToDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const iso = `${y}/${m}/${d}`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt;
};

export default function ProgressoScreen() {
  const [pesos, setPesos] = React.useState([]);
  const [medidas, setMedidas] = React.useState([]);
  const [perfil, setPerfil] = React.useState(null);

  // Firestore
  const carregarPesos = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const ref = collection(db, "pesos");
    const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const carregarMedidas = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const ref = collection(db, "medidas");
    const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const carregarPerfil = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    const ref = collection(db, "perfil");
    const q = query(ref, where("uid", "==", uid));
    const snap = await getDocs(q);
    if (!snap.docs.length) return null;
    return snap.docs[0].data();
  };

  const carregar = async () => {
    try {
      const [pesosDB, medidasDB, perfilDB] = await Promise.all([
        carregarPesos(),
        carregarMedidas(),
        carregarPerfil(),
      ]);
      setPesos(pesosDB);
      setMedidas(medidasDB);
      setPerfil(perfilDB);
    } catch {}
  };

  useFocusEffect(
    React.useCallback(() => {
      carregar();
    }, [])
  );

  const toChrono = (arr, n) => {
    const withDate = arr
      .map((r) => ({ ...r, _parsed: parsePtBrDateToDate(r.data) }))
      .filter((r) => r._parsed instanceof Date);

    withDate.sort((a, b) => a._parsed - b._parsed);
    return withDate.slice(-n);
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForDots: { r: "3" },
    propsForLabels: { fontSize: 10 },
  };

  const Section = ({ title, labels, datasets, suffix }) => {
    const hasData =
      Array.isArray(datasets) && datasets[0] && datasets[0].data.length >= 2;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>

        {hasData ? (
          <LineChart
            width={screenWidth - 32}
            height={220}
            data={{ labels, datasets }}
            withDots
            withShadow
            withInnerLines
            withOuterLines
            yAxisSuffix={` ${suffix}`}
            xLabelsOffset={-4}
            verticalLabelRotation={labels.length > 6 ? 45 : 0}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Text style={styles.hint}>Registre ao menos 2 valores para ver o gráfico.</Text>
        )}
      </View>
    );
  };

  // PESOS
  const metaPeso = perfil?.metaPeso ? Number(perfil.metaPeso) : null;

  const pesosChrono = toChrono(pesos, 12);
  const pesoLabels = pesosChrono.map((r) => r.data);
  const pesoValues = pesosChrono.map((r) => Number(r.valor) || 0);

  const datasetsPeso = [
    { data: pesoValues, color: (o = 1) => `rgba(52,152,219,${o})` },
  ];

  if (metaPeso != null && pesoValues.length >= 2) {
    datasetsPeso.push({
      data: new Array(pesoValues.length).fill(metaPeso),
      withDots: false,
      color: (o = 1) => `rgba(231,76,60,${o})`,
      strokeWidth: 2,
    });
  }

  // MEDIDAS
  const medidasChrono = toChrono(medidas, 12);

  const build = (key) => ({
    labels: medidasChrono.map((r) => r.data),
    data: medidasChrono.map((r) => Number(r[key]) || 0),
  });

  const c = build("cintura");
  const p = build("peito");
  const b = build("braco");
  const x = build("coxa");

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}>
      <Text style={[styles.title, { textAlign: "center" }]}>📊 Progresso</Text>

      <Section
        title={`Peso${metaPeso != null ? ` · Meta: ${metaPeso.toFixed(1)} kg` : ""}`}
        labels={pesoLabels}
        datasets={datasetsPeso}
        suffix="kg"
      />

      <Section title="Cintura" labels={c.labels} datasets={[{ data: c.data }]} suffix="cm" />
      <Section title="Peito" labels={p.labels} datasets={[{ data: p.data }]} suffix="cm" />
      <Section title="Braço" labels={b.labels} datasets={[{ data: b.data }]} suffix="cm" />
      <Section title="Coxa" labels={x.labels} datasets={[{ data: x.data }]} suffix="cm" />
    </ScrollView>
  );
}
