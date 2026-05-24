import React from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Image, 
    TouchableOpacity,
    Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCarrito } from "../context/CarritoContext";
import { obtenerUrlImagen } from "../services/api";
import { colors2 } from "../colors/estilo";

const CarritoScreen = () => {
    const navigation = useNavigation();
    const { 
        carrito, 
        agregarAlCarrito, 
        quitarDelCarrito, 
        eliminarDelCarrito,
        calcularTotal 
    } = useCarrito();
    
    const imagenUrl = obtenerUrlImagen(1, 1);
    const total = calcularTotal();

    const aumentarCantidad = (producto) => {
        const stockDisponible = producto.stock - producto.cantidad;
        
        if (stockDisponible > 0) {
            agregarAlCarrito(producto, 1);
        } else {
            Alert.alert("Stock limitado", "No hay más stock disponible");
        }
    };

    const disminuirCantidad = (producto) => {
        if (producto.cantidad > 1) {
            quitarDelCarrito(producto.id);
        }
    };

    const confirmarEliminar = (producto) => {
        Alert.alert(
            "Eliminar producto",
            `¿Quieres eliminar "${producto.nombre}" del carrito?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: () => eliminarDelCarrito(producto.id)
                }
            ]
        );
    };

    return (
        <View style={styles.contenedor}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.botonVolver} 
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    <Text style={styles.textoVolver}>Volver</Text>
                </TouchableOpacity>
                <Text style={styles.titulo}>Mi Carrito</Text>
            </View>

            {carrito.length === 0 ? (
                <View style={styles.carritoVacio}>
                    <MaterialCommunityIcons name="cart-off" size={80} color="#CCC" />
                    <Text style={styles.textoVacio}>Tu carrito está vacío</Text>
                </View>
            ) : (
                <ScrollView style={styles.lista}>
                    {carrito.map((producto) => (
                        <View key={producto.id} style={styles.productoCard}>
                            <Image 
                                source={{ uri: imagenUrl }} 
                                style={styles.productoImagen}
                                resizeMode="contain"
                            />
                            
                            <View style={styles.productoInfo}>
                                <Text style={styles.productoNombre} numberOfLines={2}>
                                    {producto.nombre}
                                </Text>
                                <Text style={styles.productoCodigo}>
                                    COD: {producto.codigo || producto.id || "—"}
                                </Text>
                                <Text style={styles.productoPrecio}>
                                    {producto.precio.toFixed(2)} Bs c/u
                                </Text>
                                
                                {/* Controles de cantidad */}
                                <View style={styles.cantidadContainer}>
                                    <TouchableOpacity 
                                        style={[
                                            styles.botonCantidad,
                                            producto.cantidad <= 1 && styles.botonDeshabilitado
                                        ]}
                                        onPress={() => disminuirCantidad(producto)}
                                        disabled={producto.cantidad <= 1}
                                    >
                                        <MaterialCommunityIcons name="minus" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                    
                                    <Text style={styles.cantidadTexto}>{producto.cantidad}</Text>
                                    
                                    <TouchableOpacity 
                                        style={[
                                            styles.botonCantidad,
                                            producto.cantidad >= producto.stock && styles.botonDeshabilitado
                                        ]}
                                        onPress={() => aumentarCantidad(producto)}
                                        disabled={producto.cantidad >= producto.stock}
                                    >
                                        <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={styles.productoSubtotal}>
                                    Subtotal: {(producto.precio * producto.cantidad).toFixed(2)} Bs
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.botonEliminar}
                                onPress={() => confirmarEliminar(producto)}
                            >
                                <MaterialCommunityIcons name="trash-can" size={24} color="#E74C3C" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    
                    <View style={styles.espacioFinal} />
                </ScrollView>
            )}

            {carrito.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalTexto}>Total:</Text>
                        <Text style={styles.totalPrecio}>{total.toFixed(2)} Bs</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.botonComprar}>
                        <MaterialCommunityIcons name="check-circle" size={24} color="#FFF" />
                        <Text style={styles.textoBoton}>Completar Compra</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.botonSeguir} 
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                        <Text style={styles.textoBoton}>Seguir comprando</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors2.grisClaro,
    },
    header: {
        padding: 15,
        backgroundColor: colors2.blanco,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    botonVolver: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    textoVolver: {
        fontSize: 16,
        color: "#333",
        marginLeft: 5,
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    carritoVacio: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textoVacio: {
        fontSize: 18,
        color: "#999",
        marginTop: 15,
    },
    lista: {
        flex: 1,
        padding: 15,
    },
    productoCard: {
        flexDirection: "row",
        backgroundColor: colors2.blanco,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    productoImagen: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: colors2.gris,
    },
    productoInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productoNombre: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors2.negro,
    },
    productoCodigo: {
        fontSize: 12,
        color: "bold",
        marginTop: 2,
    },
    productoPrecio: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    cantidadContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    botonCantidad: {
        backgroundColor: colors2.lila,
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    botonDeshabilitado: {
        backgroundColor: colors2.grisOscuro,
    },
    cantidadTexto: {
        fontSize: 16,
        fontWeight: "bold",
        marginHorizontal: 15,
        color: "#333",
        minWidth: 25,
        textAlign: "center",
    },
    productoSubtotal: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#27AE60",
        marginTop: 8,
    },
    botonEliminar: {
        padding: 10,
    },
    footer: {
        backgroundColor: colors2.blanco,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    totalTexto: {
        fontSize: 18,
        color: colors2.negro,
    },
    totalPrecio: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#8E44AD",
    },
    botonComprar: {
        backgroundColor: colors2.verde,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
    },
    botonSeguir: {
        backgroundColor: colors2.lila,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    textoBoton: {
        color: colors2.blanco,
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 10,
    },
    espacioFinal: {
        height: 150,
    },
});

export default CarritoScreen;
