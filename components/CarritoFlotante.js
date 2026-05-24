import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCarrito } from "../context/CarritoContext";

const CarritoFlotante = () => {
    const navigation = useNavigation();
    const { contarProductos, calcularTotal } = useCarrito();
    
    const cantidad = contarProductos();
    const total = calcularTotal();

    if (cantidad === 0) return null;

    return (
        <TouchableOpacity 
            style={styles.contenedor} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Carrito")}
        >
            <View style={styles.badge}>
                <Text style={styles.badgeTexto}>{cantidad}</Text>
            </View>
            
            <MaterialCommunityIcons name="cart" size={28} color="#FFF" />
            <Text style={styles.precio}>{total.toFixed(2)} Bs</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        position: "absolute",
        bottom: 90,  
        right: 20,   
        backgroundColor: "#8E44AD",  
        flexDirection: "row",  
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,  
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    badge: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#E74C3C",
        width: 24,
        height: 24,
        borderRadius: 12,  
        justifyContent: "center",
        alignItems: "center",
    },
    badgeTexto: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    precio: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
});

export default CarritoFlotante;
