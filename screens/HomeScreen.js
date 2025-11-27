import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  useWindowDimensions,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../styles";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const getMotivation = async () => {
  try {
    const resp = await fetch("https://dummyjson.com/quotes/random");

    if (!resp.ok) throw new Error("Falha na API");

    const data = await resp.json();

    return {
      frase: data.quote,
      autor: data.author,
    };

  } catch (e) {
    console.log("Erro ao buscar frase motivacional:", e);
    return {
      frase: "Stay focused and keep going.",
      autor: "ShapeStats",
    };
  }
};

export default function HomeScreen({ navigation }) {
  const [pesos, setPesos] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [perfil, setPerfil] = useState({
    nome: "",
    idade: "",
    altura: "",
    metaPeso: "",
  });

  const [motivacao, setMotivacao] = useState({ frase: "", autor: "" });
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];

  const { height } = useWindowDimensions();
  const bottomPadding = Math.max(24, Math.min(80, Math.round(height * 0.06)));
  const spacerHeight = Math.max(16, Math.min(56, Math.round(height * 0.035)));

  const getUserCollectionOrdered = async (colecao, uid) => {
    try {
      const ref = collection(db, colecao);
      const q = query(
        ref,
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.log(`Erro ao carregar ${colecao}:`, e);
      return [];
    }
  };

  const carregar = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const pesosUser = await getUserCollectionOrdered("pesos", uid);
      const medidasUser = await getUserCollectionOrdered("medidas", uid);

      setPesos(pesosUser ?? []);
      setMedidas(medidasUser ?? []);

      const perfilSnap = await getDoc(doc(db, "perfil", uid));
      if (perfilSnap.exists()) {
        const p = perfilSnap.data();
        setPerfil({
          nome: p.nome || "",
          idade: p.idade ? Number(p.idade) : null,
          altura: p.altura ? Number(p.altura) : null,
          metaPeso: p.metaPeso ? Number(p.metaPeso) : null,
        });
      }
      
      const motiv = await getMotivation();
      setMotivacao(motiv);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    } catch (e) {
      console.log("Erro ao carregar:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  };

  const lastPeso = pesos.length ? Number(pesos[0].valor) : null;
  const startPeso = pesos.length
    ? Number(pesos[pesos.length - 1].valor)
    : null;

  const metaPeso = perfil.metaPeso != null ? Number(perfil.metaPeso) : null;
  const alturaM = perfil.altura ? perfil.altura / 100 : null;

  const imc = lastPeso && alturaM ? lastPeso / (alturaM * alturaM) : null;

  const hasAll =
    lastPeso != null && startPeso != null && metaPeso != null;
  const raw = hasAll ? (lastPeso - startPeso) / (metaPeso - startPeso) : 0;

  const progress = Number.isFinite(raw)
    ? Math.max(0, Math.min(1, raw))
    : 0;

  const reached = hasAll
    ? (metaPeso < startPeso && lastPeso <= metaPeso) ||
    (metaPeso > startPeso && lastPeso >= metaPeso)
    : false;

  const remainingAbs = hasAll
    ? Math.abs(metaPeso - lastPeso)
    : null;

  const resumoMedidas = medidas.length ? medidas[0] : null;
  const delta =
    lastPeso != null && startPeso != null
      ? lastPeso - startPeso
      : null;

  const formatKg = (v) => (v == null ? "-" : `${Number(v).toFixed(1)} kg`);
  const formatCm = (v) => (v ? `${Number(v).toFixed(1)} cm` : "-");

  const imcCategoria = (val) => {
    if (!val) return "-";
    if (val < 18.5) return "Abaixo do peso";
    if (val < 25) return "Normal";
    if (val < 30) return "Sobrepeso";
    return "Obesidade";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          gap: 12,
          paddingBottom: bottomPadding,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>ShapeStats</Text>

        <Text style={styles.greeting}>
          {perfil?.nome
            ? `Olá, ${perfil.nome}!`
            : "Defina seu perfil para personalizar o app."}
        </Text>

        <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
          backgroundColor: "#6c5ce7",
          padding: 16,
          borderRadius: 16,
          ...Platform.select({
            web: {
              boxShadow: "0px 4px 6px rgba(0,0,0,0.15)",
            },
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 4 },
            },
            android: {
              elevation: 3,
            },
          }),
        }}
        >
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Text
              onPress={async () => {
                fadeAnim.setValue(0);
                const nova = await getMotivation();
                setMotivacao(nova);

                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: Platform.OS !== "web",
                }).start();
              }}
              style={{
                fontSize: 12,
                color: "white",
                opacity: 0.8,
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.15)",
                overflow: "hidden",
              }}
            >
              ↻ Nova frase
            </Text>
          </View>

          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 6,
            }}
          >
            ✨ Motivação do Dia
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 15,
              fontStyle: "italic",
            }}
          >
            "{motivacao.frase}"
          </Text>

          <Text
            style={{
              textAlign: "right",
              color: "rgba(255,255,255,0.8)",
              fontWeight: "500",
              marginTop: 8,
            }}
          >
            — {motivacao.autor}
          </Text>
        </Animated.View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do Peso</Text>

          <View style={styles.rowBetween}>
            <View style={styles.col}>
              <Text style={styles.label}>Peso atual</Text>
              <Text style={styles.value}>{formatKg(lastPeso)}</Text>
              <Text style={styles.hint}>
                {pesos[0]?.data
                  ? `Atualizado em ${pesos[0].data}`
                  : "Sem registros"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Meta</Text>
              <Text style={styles.value}>{formatKg(metaPeso)}</Text>
              <Text style={styles.hint}>
                {hasAll
                  ? remainingAbs === 0
                    ? "Meta atingida! 🎯"
                    : reached
                      ? `Ultrapassou ${remainingAbs.toFixed(1)} kg`
                      : `Faltam ${remainingAbs.toFixed(1)} kg`
                  : "Defina meta no Perfil"}
              </Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <View
              style={[styles.progressBar, { width: `${progress * 100}%` }]}
            />
          </View>

          <Text style={styles.hint}>
            {hasAll
              ? `${Math.round(progress * 100)}% do caminho até a meta`
              : "Registre peso e meta para ver o progresso"}
          </Text>

          <Text
            style={[
              styles.delta,
              {
                color:
                  delta != null
                    ? delta <= 0
                      ? "#2ecc71"
                      : "#e67e22"
                    : "#999",
              },
            ]}
          >
            {delta != null
              ? `Desde o início: ${delta > 0 ? "+" : ""}${delta.toFixed(
                1
              )} kg`
              : "Sem histórico suficiente"}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>IMC</Text>
          <Text style={styles.value}>{imc ? imc.toFixed(1) : "-"}</Text>
          <Text style={styles.hint}>
            {imc
              ? imcCategoria(imc)
              : "Informe altura no Perfil e registre um peso"}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Últimas Medidas</Text>

          {resumoMedidas ? (
            <>
              <Text style={styles.hint}>
                Atualizado em {resumoMedidas.data}
              </Text>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.labelSm}>Cintura</Text>
                  <Text style={styles.valueSm}>
                    {formatCm(resumoMedidas.cintura)}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.labelSm}>Peito</Text>
                  <Text style={styles.valueSm}>
                    {formatCm(resumoMedidas.peito)}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.labelSm}>Braço</Text>
                  <Text style={styles.valueSm}>
                    {formatCm(resumoMedidas.braco)}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.labelSm}>Coxa</Text>
                  <Text style={styles.valueSm}>
                    {formatCm(resumoMedidas.coxa)}
                  </Text>
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
