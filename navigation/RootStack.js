import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import PerfilInicialScreen from "../screens/PerfilInicialScreen";

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="PerfilInicial" component={PerfilInicialScreen} />
    </Stack.Navigator>
  );
}
