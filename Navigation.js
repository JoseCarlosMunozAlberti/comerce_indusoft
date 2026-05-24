import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InicioScreen from "./screens/InicioScreen";
import CuentaScreen from "./screens/CuentaScreen";
import RegistroScreen from "./screens/RegistroScreen";
import ProductoDetalleScreen from "./screens/ProductoDetalleScreen";
import CarritoScreen from "./screens/CarritoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InicioStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Inicio" component={InicioScreen} />
            <Stack.Screen name="ProductoDetalle" component={ProductoDetalleScreen} />
            <Stack.Screen name="Carrito" component={CarritoScreen} />
        </Stack.Navigator>
    );
}

function CuentaStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Cuenta" component={CuentaScreen} />
            <Stack.Screen name="Registro" component={RegistroScreen} />
        </Stack.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="InicioTab"
            screenOptions={{
                tabBarActiveTintColor: "#8E44AD",
                headerTitleAlign: "center",
                headerTitle: "Comerce Indusoft",
                headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#FFF",
                },
                headerStyle: {
                    backgroundColor: "#8E44AD",
                },
            }}
        >
            <Tab.Screen 
                name="InicioTab" 
                component={InicioStack} 
                options={{
                    tabBarLabel: "Inicio",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen 
                name="CuentaStack" 
                component={CuentaStack} 
                options={{
                    tabBarLabel: "Cuenta",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    return (
        <NavigationContainer>
            <TabNavigator />
        </NavigationContainer>
    );
}
