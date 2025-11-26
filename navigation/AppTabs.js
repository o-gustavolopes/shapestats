import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PesoScreen from "../screens/PesoScreen";
import MedidasScreen from "../screens/MedidasScreen";
import ProgressoScreen from "../screens/ProgressoScreen";
import PerfilScreen from "../screens/PerfilScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2e86de",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: Platform.select({
          web: {
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: 56,
            borderTopWidth: 0,
            backgroundColor: "#f8f9fa",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: -1 },
            zIndex: 10,
          },
          default: {
            backgroundColor: "#f8f9fa",
            borderTopColor: "#eaeaea",
          },
        }),
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Peso":
              iconName = "barbell-outline";
              break;
            case "Medidas":
              iconName = "body-outline";
              break;
            case "Progresso":
              iconName = "stats-chart-outline";
              break;
            case "Perfil":
              iconName = "person-circle-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Peso" component={PesoScreen} />
      <Tab.Screen name="Medidas" component={MedidasScreen} />
      <Tab.Screen name="Progresso" component={ProgressoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
