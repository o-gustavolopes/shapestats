import React from "react";
import { View, Text, ScrollView, Dimensions, Platform } from "react-native";
import { getCollectionOrdered, getSingleDoc } from "../utils/firestoreUtils";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import styles from "../styles";

const screenWidth = Dimensions.get("window").width;

export default function ProgressoScreen() {
  const [pesos, setPesos] = React.useState([]);
  const [medidas, setMedidas] = React.useState([]);
  const [perfil, setPerfil] = React.useState(null);

  const carregar = async () => {
    const pesosDB = await getCollectionOrdered("pesos");
    const medidasDB = await getCollectionOrdered("medidas");
    const perfilDB = await getSingleDoc("perfil", "perfilUsuario");

    setPesos(pesosDB ?? []);
    setMedidas(medidasDB ?? []);
    setPerfil(perfilDB ?? null);
  };

  useFocusEffect(React.useCallback(() => { carregar(); }, []));

  const toChrono = (arr, n) => [...arr].slice(0, n).reverse();

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

  const Section = ({ title, labels, datasets, suffix }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {Platform.OS === "web" ? (
        <Text style={styles.hint}>
          Gráficos não são compatíveis com a versão Web.
        </Text>
      ) : datasets[0].data.length >= 2 ? (
        <LineChart
          width={screenWidth - 32}
          height={220}
          data={{ labels, datasets }}
          withDots
          withShadow
          withInnerLines
          withOuterLines
          animate
          bezier
          yAxisSuffix={` ${suffix}`}
          xLabelsOffset={-4}
          verticalLabelRotation={labels.length > 6 ? 45 : 0}
          chartConfig={chartConfig}
          style={{ borderRadius: 12 }}
        />
      ) : (
        <Text style={styles.hint}>Registre ao menos 2 valores para ver o gráfico.</Text>
      )}
    </View>
  );

  const metaPeso = perfil?.metaPeso ? Number(perfil.metaPeso) : null;

  const pesosChrono = toChrono(pesos, 12);
  const pesoLabels = pesosChrono.map(r => r.data);
  const pesoValues = pesosChrono.map(r => Number(r.valor) || 0);

  const datasetsPeso = [{ data: pesoValues }];

  if (metaPeso != null && pesoValues.length >= 2) {
    datasetsPeso.push({
      data: new Array(pesoValues.length).fill(metaPeso),
      withDots: false,
      color: (opacity = 1) => `rgba(231,76,60,${opacity})`,
      strokeWidth: 2,
    });
  }

  const medidasChrono = toChrono(medidas, 12);
  const build = (key) => ({
    labels: medidasChrono.map(r => r.data),
    data: medidasChrono.map(r => Number(r[key]) || 0),
  });

  const c = build("cintura");
  const p = build("peito");
  const b = build("braco");
  const x = build("coxa");

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}>
      <Text style={[styles.title, { textAlign: "center" }]}>
        📊 Progresso
      </Text>

      <Section
        title={`Peso${metaPeso != null ? ` · Meta: ${metaPeso.toFixed(1)} kg` : ""}`}
        labels={pesoLabels}
        datasets={datasetsPeso}
        suffix="kg"
      />

      <Section title="Cintura" labels={c.labels} datasets={[{ data: c.data }]} suffix="cm" />
      <Section title="Peito"   labels={p.labels} datasets={[{ data: p.data }]} suffix="cm" />
      <Section title="Braço"   labels={b.labels} datasets={[{ data: b.data }]} suffix="cm" />
      <Section title="Coxa"    labels={x.labels} datasets={[{ data: x.data }]} suffix="cm" />
    </ScrollView>
  );
}
