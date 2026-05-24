import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Dimensions,
    StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCarrito } from "../context/CarritoContext";
import { obtenerUrlImagen } from "../services/api";

const { width, height } = Dimensions.get("window");
const IMAGEN_HEIGHT = height * 0.40;

const ProductoDetalleScreen = ({ route }) => {
    const navigation = useNavigation();
    const { agregarAlCarrito, obtenerCantidadEnCarrito } = useCarrito();
    
    const producto = route.params?.producto || {};
    const [cantidad, setCantidad] = useState(1);
    
    const precio = producto.precio || 0;
    const stock = producto.stock || 0;
    const importe = precio * cantidad;
    const imagenUrl = obtenerUrlImagen(producto.id || 1, 1);
    
    // Cantidad ya en carrito de este producto
    const enCarrito = obtenerCantidadEnCarrito(producto.id);
    const stockDisponible = stock - enCarrito;
    const sinStock = stockDisponible <= 0;

    const aumentarCantidad = () => {
        if (cantidad < stockDisponible) {
            setCantidad(prev => prev + 1);
        } else {
            Alert.alert(
                "Stock limitado", 
                `Solo hay ${stockDisponible} unidades disponibles`
            );
        }
    };
    
    const disminuirCantidad = () => {
        if (cantidad > 1) setCantidad(prev => prev - 1);
    };

    const agregarOrden = () => {
        if (sinStock) {
            Alert.alert("Sin stock", "Este producto no tiene stock disponible");
            return;
        }
        
        if (cantidad > stockDisponible) {
            Alert.alert(
                "Stock insuficiente", 
                `Solo puedes agregar ${stockDisponible} unidades`
            );
            return;
        }
        
        agregarAlCarrito(producto, cantidad);
        navigation.navigate("Inicio");
    };

    return (
        <View style={styles.contenedor}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <ScrollView 
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Hero Image Section */}
                <View style={styles.imagenHeroContainer}>
                    <Image 
                        source={{ uri: imagenUrl }}
                        style={styles.imagenHero}
                        resizeMode="cover"
                    />
                    
                    {/* Gradient overlay */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.gradientOverlay}
                    />

                    {/* Header flotante */}
                    <View style={styles.headerFlotante}>
                        <TouchableOpacity 
                            style={styles.botonCircular} 
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>
                        {/*
                        <View style={styles.headerAcciones}>
                            <TouchableOpacity style={styles.botonCircular}>
                                <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botonCircular, { marginLeft: 12 }]}>
                                <MaterialCommunityIcons name="heart-outline" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        */}
                    </View>

                    {/* Badge de stock en imagen */}
                    {sinStock && (
                        <View style={styles.agotadoOverlay}>
                            <View style={styles.agotadoBadge}>
                                <MaterialCommunityIcons name="alert-circle" size={20} color="#FFF" />
                                <Text style={styles.agotadoTexto}>Agotado</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Info Container con esquinas redondeadas */}
                <View style={styles.infoContainer}>
                    {/* Indicador de arrastre */}
                    <View style={styles.dragIndicator} />
                    
                    {/* Marca y código */}
                    <View style={styles.topInfo}>
                        {producto.marca && (
                            <View style={styles.marcaBadge}>
                                <Text style={styles.marcaTexto}>
                                    {producto.marca.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={styles.codigoTexto}>
                            COD: {producto.codigo || producto.id || ""}
                        </Text>
                    </View>

                    {/* Nombre del producto */}
                    <Text style={styles.nombreProducto}>
                        {producto.nombre || "Sin nombre"}
                    </Text>
                    
                    {/* Badge de stock */}
                    <View style={[styles.stockContainer, sinStock && styles.stockContainerAgotado]}>
                        <MaterialCommunityIcons 
                            name={sinStock ? "alert-circle-outline" : "package-variant"} 
                            size={20} 
                            color={sinStock ? "#E74C3C" : "#27AE60"} 
                        />
                        <Text style={[styles.stockTexto, sinStock && styles.stockTextoAgotado]}>
                            {sinStock 
                                ? "Sin stock disponible" 
                                : `${stockDisponible} unidades disponibles`
                            }
                        </Text>
                        {enCarrito > 0 && (
                            <View style={styles.carritoInfoBadge}>
                                <MaterialCommunityIcons name="cart" size={14} color="#8E44AD" />
                                <Text style={styles.enCarritoTexto}>{enCarrito}</Text>
                            </View>
                        )}
                    </View>
                    
                    {/* Detalles */}
                    <View style={styles.detallesContainer}>
                        {producto.linea && (
                            <View style={styles.detalleItem}>
                                <View style={styles.detalleIcono}>
                                    <MaterialCommunityIcons name="tag" size={18} color="#8E44AD" />
                    </View>
                                <View>
                                    <Text style={styles.detalleLabel}>Línea</Text>
                                    <Text style={styles.detalleValor}>{producto.linea}</Text>
                        </View>
                        </View>
                    )}
                    </View>

                    {/* Selector de cantidad */}
                    {!sinStock && (
                        <View style={styles.cantidadSection}>
                            <Text style={styles.cantidadLabel}>Cantidad</Text>
                            
                            <View style={styles.cantidadControls}>
                                <TouchableOpacity 
                                    style={[
                                        styles.cantidadBoton, 
                                        cantidad <= 1 && styles.cantidadBotonDisabled
                                    ]} 
                                    onPress={disminuirCantidad}
                                    disabled={cantidad <= 1}
                                >
                                    <MaterialCommunityIcons 
                                        name="minus" 
                                        size={24} 
                                        color={cantidad <= 1 ? "#CCC" : "#8E44AD"} 
                                    />
                                </TouchableOpacity>
                                
                                <View style={styles.cantidadDisplay}>
                                    <Text style={styles.cantidadNumero}>{cantidad}</Text>
                                </View>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.cantidadBoton, 
                                        cantidad >= stockDisponible && styles.cantidadBotonDisabled
                                    ]} 
                                    onPress={aumentarCantidad}
                                    disabled={cantidad >= stockDisponible}
                                >
                                    <MaterialCommunityIcons 
                                        name="plus" 
                                        size={24} 
                                        color={cantidad >= stockDisponible ? "#CCC" : "#8E44AD"} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Resumen de precios */}
                    <View style={styles.preciosContainer}>
                        <View style={styles.precioRow}>
                            <Text style={styles.precioLabel}>Precio unitario</Text>
                            <Text style={styles.precioUnitario}>{precio.toFixed(2)} Bs</Text>
                        </View>
                        
                        <View style={styles.separador} />
                        
                        <View style={styles.precioRow}>
                            <Text style={styles.totalLabel}>Total a pagar</Text>
                            <Text style={styles.totalPrecio}>{importe.toFixed(2)} Bs</Text>
                        </View>
                    </View>

                    <View style={styles.espacioFinal} />
                </View>
            </ScrollView>

            {/* Footer fijo con botones */}
            <View style={styles.footerContainer}>
                <TouchableOpacity 
                    style={styles.botonVolver}
                    onPress={() => navigation.navigate("Inicio")}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#8E44AD" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.botonAgregar, sinStock && styles.botonAgotado]} 
                    onPress={agregarOrden}
                    disabled={sinStock}
                >
                    <MaterialCommunityIcons 
                        name={sinStock ? "cart-off" : "cart-plus"} 
                        size={24} 
                        color="#FFF" 
                    />
                    <Text style={styles.botonAgregarTexto}>
                        {sinStock ? "Sin stock" : `Agregar · ${importe.toFixed(2)} Bs`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    scroll: {
        flex: 1,
    },
    imagenHeroContainer: {
        width: width,
        height: IMAGEN_HEIGHT,
        backgroundColor: "#F5F5F5",
        position: "relative",
    },
    imagenHero: {
        width: "100%",
        height: "100%",
    },
    gradientOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerFlotante: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
    },
    headerAcciones: {
        flexDirection: "row",
    },
    botonCircular: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },
    agotadoOverlay: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    agotadoBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E74C3C",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    agotadoTexto: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 8,
    },
    infoContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        marginTop: -25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 15,
        minHeight: height * 0.55,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: "#E0E0E0",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    topInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    marcaBadge: {
        backgroundColor: "#F0E6F6",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    marcaTexto: {
        fontSize: 12,
        fontWeight: "800",
        color: "#8E44AD",
        letterSpacing: 1,
    },
    codigoTexto: {
        fontSize: 13,
        color: "#999",
        fontWeight: "600",
    },
    nombreProducto: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1A1A2E",
        lineHeight: 34,
        marginBottom: 18,
    },
    stockContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 16,
        marginBottom: 25,
    },
    stockContainerAgotado: {
        backgroundColor: "#FFEBEE",
    },
    stockTexto: {
        fontSize: 15,
        fontWeight: "600",
        color: "#27AE60",
        marginLeft: 10,
        flex: 1,
    },
    stockTextoAgotado: {
        color: "#E74C3C",
    },
    carritoInfoBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    enCarritoTexto: {
        fontSize: 13,
        fontWeight: "700",
        color: "#8E44AD",
        marginLeft: 4,
    },
    detallesContainer: {
        marginBottom: 20,
    },
    detalleItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    detalleIcono: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F0E6F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    detalleLabel: {
        fontSize: 12,
        color: "#999",
    },
    detalleValor: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginTop: 2,
    },
    cantidadSection: {
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
    },
    cantidadLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 15,
        textAlign: "center",
    },
    cantidadControls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    cantidadBoton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cantidadBotonDisabled: {
        backgroundColor: "#F5F5F5",
        elevation: 0,
    },
    cantidadDisplay: {
        width: 80,
        alignItems: "center",
    },
    cantidadNumero: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1A1A2E",
    },
    preciosContainer: {
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        padding: 20,
    },
    precioRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    precioLabel: {
        fontSize: 15,
        color: "#666",
    },
    precioUnitario: {
        fontSize: 17,
        fontWeight: "700",
        color: "#333",
    },
    separador: {
        height: 1,
        backgroundColor: "#E8E8E8",
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A2E",
    },
    totalPrecio: {
        fontSize: 24,
        fontWeight: "800",
        color: "#8E44AD",
    },
    espacioFinal: {
        height: 100,
    },
    footerContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingBottom: 30,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    botonVolver: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: "#F0E6F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    botonAgregar: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#27AE60",
        paddingVertical: 18,
        borderRadius: 18,
    },
    botonAgotado: {
        backgroundColor: "#CCC",
    },
    botonAgregarTexto: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: "800",
        marginLeft: 10,
    },
});

export default ProductoDetalleScreen;
