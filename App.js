import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

import RootStack from "./navigation/RootStack";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;

  // RootStack sempre carregado — ele decide internamente
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
