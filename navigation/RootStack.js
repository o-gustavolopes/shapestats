import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";      // Login, Cadastro, PerfilInicial está no root agora
import AppTabs from "./AppTabs";
import PerfilInicialScreen from "../screens/PerfilInicialScreen";

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* AuthStack contém Login / Cadastro */}
      <Stack.Screen name="AuthStack" component={AuthStack} />
      {/* AppTabs contém Home, Peso, Perfil, ... */}
      <Stack.Screen name="AppTabs" component={AppTabs} />
      {/* PerfilInicial fica no root: assim qualquer navigator pode navegar pra ela */}
      <Stack.Screen name="PerfilInicial" component={PerfilInicialScreen} />
    </Stack.Navigator>
  );
}
