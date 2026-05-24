import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList,
    TextInput,
    ActivityIndicator,
    Image,
    Modal,
    Dimensions,
    Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CarritoFlotante from "../components/CarritoFlotante";
import { buscarProductos, obtenerUrlImagen, traerCategorias } from "../services/api";
import { useConfig } from "../context/ConfigContext";
import { colors2 } from "../colors/estilo";


const { width } = Dimensions.get("window");
const LIMITE_PRODUCTOS = 20;
const NUM_COLUMNAS = 4;
const ANCHO_PRODUCTO = (width - 32) / NUM_COLUMNAS;

// Componente ProductoCard optimizado con memo
const ProductoCard = memo(({ producto, onPress }) => {
    const imagenUrl = obtenerUrlImagen(producto.id, 1);
    const sinStock = producto.stock <= 0;
    
    return (
        <TouchableOpacity 
            style={styles.productoCard}
            activeOpacity={0.9}
            onPress={() => onPress(producto)}
        >
            <View style={styles.imagenWrapper}>
                <Image 
                    source={{ uri: imagenUrl }}
                    style={styles.productoImagen}
                    resizeMode="contain"
                />
                
                {sinStock && (
                    <View style={styles.agotadoBadge}>
                        <Text style={styles.agotadoTexto}>Agotado</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.productoInfo}>
                {producto.marca && (
                    <Text style={styles.marcaTexto} numberOfLines={1}>
                        {producto.marca.toUpperCase()}
                    </Text>
                )}
                
                <Text style={styles.productoNombre} numberOfLines={2}>
                    {producto.nombre}
                </Text>
                
                <View style={styles.precioRow}>
                    <Text style={styles.precio}>
                        {producto.precio.toFixed(2)} 
                        <Text style={styles.moneda}> Bs</Text>
                    </Text>
                </View>
                
                <TouchableOpacity 
                    style={[
                        styles.agregarBoton,
                        sinStock && styles.agregarBotonDisabled
                    ]}
                    disabled={sinStock}
                    onPress={() => onPress(producto)}
                >
                    <MaterialCommunityIcons name="plus" size={12} color="#FFF" />
                    <Text style={styles.agregarTexto}>Ver</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
});

// Componente CategoriaItem optimizado con memo
const CategoriaItem = memo(({ item, isSelected, onPress }) => (
    <TouchableOpacity
        style={[
            styles.categoriaItem,
            isSelected && styles.categoriaItemActiva
        ]}
        onPress={() => onPress(item.ipognume)}
        activeOpacity={0.8}
    >
        <View style={[
            styles.categoriaIcono,
            isSelected && styles.categoriaIconoActivo
        ]}>
            <MaterialCommunityIcons 
                name="tag" 
                size={20} 
                color={isSelected ? "#FFF" : "#8E44AD"} 
            />
        </View>
        <Text 
            style={[
                styles.categoriaTexto,
                isSelected && styles.categoriaTextoActivo
            ]} 
            numberOfLines={2}
        >
            {item.ipogdesc}
        </Text>
    </TouchableOpacity>
));

// Header memoizado (sin cambios de estilo) para evitar que se desmonte el TextInput
const Header = memo(React.forwardRef(({
    categorias,
    categoriaSeleccionada,
    seleccionarCategoria,
    obtenerNombreSucursal,
    busqueda,
    setBusqueda,
    limpiarBusqueda,
    cargarProductos,
    cargando,
    error,
    abrirModal
}, ref) => {
    return (
        <>
            <TouchableOpacity 
                style={styles.selectorSucursal}
                onPress={abrirModal}
            >
                <View style={styles.sucursalIconContainer}>
                    <MaterialCommunityIcons name="store" size={20} color="#FFF" />
                </View>
                <View style={styles.sucursalTextContainer}>
                    <Text style={styles.sucursalLabel}>Entregar en</Text>
                    <Text style={styles.sucursalTexto} numberOfLines={1}>
                        {obtenerNombreSucursal()}
                    </Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#8E44AD" />
            </TouchableOpacity>

            <View style={styles.categoriasSection}>
                <Text style={styles.categoriasTitulo}>Categorías</Text>
                <FlatList
                    data={[{ ipognume: 0, ipogdesc: "Todos" }, ...categorias]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => `cat-${item.ipognume ?? index}`}
                    contentContainerStyle={styles.categoriasLista}
                    renderItem={({ item }) => (
                        <CategoriaItem 
                            item={item} 
                            isSelected={categoriaSeleccionada === item.ipognume}
                            onPress={seleccionarCategoria}
                        />
                    )}
                />
            </View>

            <View style={styles.busquedaContainer}>
                <MaterialCommunityIcons name="magnify" size={24} color="#8E44AD" />
                <TextInput
                    ref={ref}
                    style={styles.inputBusqueda}
                    placeholder="¿Qué estás buscando?"
                    value={busqueda}
                    onChangeText={(t) => { setBusqueda(t); }}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    placeholderTextColor="#999"
                    returnKeyType="search"
                />
                {busqueda.length > 0 && (
                    <TouchableOpacity onPress={limpiarBusqueda}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.seccionHeader}>
                <Text style={styles.tituloSeccion}>{busqueda ? "Resultados" : obtenerNombreSucursal()}</Text>
            </View>

            {cargando && (
                <View style={styles.estadoContainer}>
                    <ActivityIndicator size="large" color="#8E44AD" />
                    <Text style={styles.estadoTexto}>Cargando productos...</Text>
                </View>
            )}

            {error && !cargando && (
                <View style={styles.estadoContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={60} color="#E74C3C" />
                    <Text style={styles.errorTexto}>{error}</Text>
                    <TouchableOpacity style={styles.botonReintentar} onPress={() => cargarProductos()}>
                        <Text style={styles.textoBoton}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}));

const InicioScreen = () => {
    const navigation = useNavigation();
    const { listaPrecio, sucursal, sucursales, cambiarSucursal, obtenerNombreSucursal } = useConfig();
    
    const [busqueda, setBusqueda] = useState("");
    const [productos, setProductos] = useState([]); // Productos visibles en pantalla
    const [productosOriginal, setProductosOriginal] = useState([]); // Todos los productos formateados de la API
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false); // Para el indicador de "cargando más"
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1); // Página actual para paginación local
    const [mostrarBotonSubir, setMostrarBotonSubir] = useState(false); // Para el botón "volver arriba"
    const inputRef = useRef(null);
    const wasTypingRef = useRef(false);
    const cargandoMasRef = useRef(false); // Ref para evitar múltiples llamadas a cargarMas
    const flatListRef = useRef(null); // Ref para controlar el scroll del FlatList

    useEffect(() => {
        cargarCategorias();
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [listaPrecio, sucursal, categoriaSeleccionada]);

    const cargarCategorias = async () => {
        try {
            const respuesta = await traerCategorias();
            setCategorias(respuesta || []);
        } catch (err) {
            console.log("Error al cargar categorías:", err);
        }
    };

    const cargarProductos = useCallback(async (textoBusqueda = "") => {
        try {
            setCargando(true);
            setError(null);
            setPaginaActual(1); // Reiniciar paginación al cargar nuevos productos
            cargandoMasRef.current = false; // Reiniciar ref de carga
            
            const respuesta = await buscarProductos(
                textoBusqueda, 
                listaPrecio, 
                sucursal, 
                categoriaSeleccionada
            );
            
            // Formatear TODOS los productos de la API (ya no limitamos aquí)
            const productosFormateados = (respuesta || []).map((item, index) => ({
                id: item.ipmpcodi || index,
                codigo: String(item.ipmpcodi || ""),
                nombre: String(item.ipmpdesc || "Sin nombre"),
                precio: Number(item.vpdlprec) || 0,
                marca: typeof item.Marca === "string" ? item.Marca : "",
                linea: typeof item.linea === "string" ? item.linea : "",
                stock: Number(item.stockDisponible) || 0,
            }));
            
            // Guardamos TODOS los productos formateados
            setProductosOriginal(productosFormateados);
            
            // Aplicamos filtro local si vino texto de búsqueda
            let productosAMostrar = productosFormateados;
            if (textoBusqueda && textoBusqueda.trim().length > 0) {
                const filtro = textoBusqueda.trim().toLowerCase();
                productosAMostrar = productosFormateados.filter(p => p.nombre.toLowerCase().includes(filtro));
            }
            
            // Mostrar solo los primeros 20 productos (primera página)
            setProductos(productosAMostrar.slice(0, LIMITE_PRODUCTOS));
        } catch (err) {
            setError("No se pudieron cargar los productos");
        } finally {
            setCargando(false);
        }
    }, [listaPrecio, sucursal, categoriaSeleccionada]);

    // Filtrado local al escribir en la caja de búsqueda (sin hacer llamadas cada tecla)
    useEffect(() => {
        // No filtrar si no hay productos cargados aún
        if (productosOriginal.length === 0) return;
        
        // Reiniciar paginación al cambiar búsqueda
        setPaginaActual(1);
        cargandoMasRef.current = false;
        
        if (!busqueda || busqueda.trim().length === 0) {
            // Sin búsqueda: mostrar primeros 20 del listado original
            setProductos(productosOriginal.slice(0, LIMITE_PRODUCTOS));
            return;
        }

        const filtro = busqueda.trim().toLowerCase();
        const filtrados = productosOriginal.filter(p => 
            p.nombre.toLowerCase().includes(filtro) ||
            p.codigo.toLowerCase().includes(filtro) ||
            (p.marca && p.marca.toLowerCase().includes(filtro))
        );
        // Mostrar primeros 20 de los filtrados
        setProductos(filtrados.slice(0, LIMITE_PRODUCTOS));
    }, [busqueda, productosOriginal]);

    // Función para cargar más productos al hacer scroll
    const cargarMasProductos = useCallback(() => {
        // Usar ref para evitar múltiples llamadas simultáneas
        if (cargandoMasRef.current || cargando) return;
        
        // Determinar la lista fuente (filtrada o completa)
        let listaFuente = productosOriginal;
        if (busqueda && busqueda.trim().length > 0) {
            const filtro = busqueda.trim().toLowerCase();
            listaFuente = productosOriginal.filter(p => 
                p.nombre.toLowerCase().includes(filtro) ||
                p.codigo.toLowerCase().includes(filtro) ||
                (p.marca && p.marca.toLowerCase().includes(filtro))
            );
        }
        
        const totalDisponibles = listaFuente.length;
        
        // Calcular cuántos productos deberíamos tener en la siguiente página
        const siguienteLimite = (paginaActual + 1) * LIMITE_PRODUCTOS;
        
        // Si el límite actual ya cubre todos los productos, no hacer nada
        if (paginaActual * LIMITE_PRODUCTOS >= totalDisponibles) return;
        
        // Marcar como cargando usando ref Y estado
        cargandoMasRef.current = true;
        setCargandoMas(true);
        
        // Pequeño delay para mejor UX
        setTimeout(() => {
            const nuevoLimite = Math.min(siguienteLimite, totalDisponibles);
            
            setProductos(listaFuente.slice(0, nuevoLimite));
            setPaginaActual(prev => prev + 1);
            setCargandoMas(false);
            cargandoMasRef.current = false;
        }, 300);
    }, [cargando, productosOriginal, busqueda, paginaActual]);

    // Verificar si hay más productos para cargar
    const hayMasProductos = useMemo(() => {
        let listaFuente = productosOriginal;
        if (busqueda && busqueda.trim().length > 0) {
            const filtro = busqueda.trim().toLowerCase();
            listaFuente = productosOriginal.filter(p => 
                p.nombre.toLowerCase().includes(filtro) ||
                p.codigo.toLowerCase().includes(filtro) ||
                (p.marca && p.marca.toLowerCase().includes(filtro))
            );
        }
        return productos.length < listaFuente.length;
    }, [productos.length, productosOriginal, busqueda]);

    // Si el usuario estaba escribiendo y la lista se actualiza, re-enfocar el input
    useEffect(() => {
        if (wasTypingRef.current && inputRef.current) {
            const t = setTimeout(() => {
                try { inputRef.current.focus(); } catch (e) { }
            }, 50);
            return () => clearTimeout(t);
        }
    }, [productos]);

    const limpiarBusqueda = useCallback(() => {
        setBusqueda("");
        cargarProductos("");
    }, [cargarProductos]);

    const seleccionarSucursal = useCallback((codigo) => {
        cambiarSucursal(codigo);
        setModalVisible(false);
    }, [cambiarSucursal]);

    const seleccionarCategoria = useCallback((codCategoria) => {
        // Limpiar búsqueda al cambiar de categoría para evitar conflictos de filtrado
        setBusqueda("");
        setCategoriaSeleccionada(codCategoria);
    }, []);

    const irADetalle = useCallback((producto) => {
        navigation.navigate("ProductoDetalle", { producto });
    }, [navigation]);

    // Manejar el scroll para mostrar/ocultar el botón "volver arriba"
    // El header (sucursal + categorías + búsqueda) tiene aprox 250px de altura
    const ALTURA_HEADER_VISIBLE = 250;
    
    const handleScroll = useCallback((event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        // Mostrar botón cuando las categorías ya no son visibles
        if (offsetY > ALTURA_HEADER_VISIBLE && !mostrarBotonSubir) {
            setMostrarBotonSubir(true);
        } else if (offsetY <= ALTURA_HEADER_VISIBLE && mostrarBotonSubir) {
            setMostrarBotonSubir(false);
        }
    }, [mostrarBotonSubir]);

    // Función para volver al inicio del scroll
    const volverAlInicio = useCallback(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    }, []);

    // Header del FlatList
    const ListHeader = useMemo(() => (
        <Header
            ref={inputRef}
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            seleccionarCategoria={seleccionarCategoria}
            obtenerNombreSucursal={obtenerNombreSucursal}
            busqueda={busqueda}
            setBusqueda={(t) => { wasTypingRef.current = true; setBusqueda(t); }}
            limpiarBusqueda={limpiarBusqueda}
            cargarProductos={cargarProductos}
            cargando={cargando}
            error={error}
           
            abrirModal={() => setModalVisible(true)}
        />
    ), [categorias, categoriaSeleccionada, seleccionarCategoria, obtenerNombreSucursal, busqueda, limpiarBusqueda, cargarProductos, cargando, error]);

    // Empty state
    const ListEmpty = () => {
        if (cargando || error) return null;
        return (
            <View style={styles.estadoContainer}>
                <MaterialCommunityIcons name="magnify-close" size={60} color="#CCC" />
                <Text style={styles.estadoTexto}>No se encontraron productos</Text>
                <Text style={styles.estadoSubtexto}>
                    Intenta con otra búsqueda o categoría
                </Text>
            </View>
        );
    };

    // Footer con indicador de carga para más productos
    const ListFooter = () => (
        <View style={styles.espacioFinal}>
            {cargandoMas && (
                <View style={styles.cargandoMasContainer}>
                    <ActivityIndicator size="small" color="#8E44AD" />
                    <Text style={styles.cargandoMasTexto}>Cargando más productos...</Text>
                </View>
            )}
            {!cargandoMas && hayMasProductos && productos.length > 0 && (
                <Text style={styles.scrollHintTexto}>Desliza para ver más</Text>
            )}
        </View>
    );

    return (
        <View style={styles.contenedor}>
            <FlatList
                ref={flatListRef}
                data={cargando || error ? [] : productos}
                numColumns={NUM_COLUMNAS}
                keyExtractor={(item) => `prod-${item.id}`}
                renderItem={({ item }) => (
                    <ProductoCard producto={item} onPress={irADetalle} />
                )}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                ListFooterComponent={ListFooter}
                contentContainerStyle={styles.listaContainer}
                showsVerticalScrollIndicator={false}
                // Detectar scroll para mostrar botón "volver arriba"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                // Paginación infinita
                onEndReached={cargarMasProductos}
                onEndReachedThreshold={0.3}
                // Optimizaciones de rendimiento
                initialNumToRender={8}
                maxToRenderPerBatch={12}
                windowSize={5}
                removeClippedSubviews={false}
                keyboardShouldPersistTaps="handled"
            />

            <CarritoFlotante />

            {/* Botón flotante para volver al inicio */}
            {mostrarBotonSubir && (
                <TouchableOpacity 
                    style={styles.botonVolverArriba}
                    onPress={volverAlInicio}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="chevron-up" size={28} color="#FFF" />
                </TouchableOpacity>
            )}

            {/* Modal de Sucursales */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContenido}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitulo}>Seleccionar Sucursal</Text>
                            <TouchableOpacity 
                                style={styles.modalCerrar}
                                onPress={() => setModalVisible(false)}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={sucursales}
                            keyExtractor={(item) => `suc-${item.ipalcodi}`}
                            contentContainerStyle={styles.modalLista}
                            renderItem={({ item: suc }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.sucursalItem,
                                        sucursal === suc.ipalcodi && styles.sucursalItemActivo
                                    ]}
                                    onPress={() => seleccionarSucursal(suc.ipalcodi)}
                                >
                                    <View style={[
                                        styles.sucursalItemIcon,
                                        sucursal === suc.ipalcodi && styles.sucursalItemIconActivo
                                    ]}>
                                        <MaterialCommunityIcons 
                                            name="store" 
                                            size={22} 
                                            color={sucursal === suc.ipalcodi ? "#FFF" : "#666"} 
                                        />
                                    </View>
                                    <View style={styles.sucursalInfo}>
                                        <Text style={[
                                            styles.sucursalNombre,
                                            sucursal === suc.ipalcodi && styles.sucursalNombreActivo
                                        ]}>
                                            {suc.ipalnomb}
                                        </Text>
                                        <Text style={styles.sucursalDireccion}>
                                            {suc.ipaldire}
                                        </Text>
                                    </View>
                                    {sucursal === suc.ipalcodi && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#8E44AD" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors2.gris,
    },
    listaContainer: {
        paddingHorizontal: 8,
    },
    
    // Selector de Sucursal
    selectorSucursal: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors2.blanco,
        marginHorizontal: 7,
        marginTop: 15,
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 16,
        elevation: 4,
        shadowColor: "#8E44AD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    sucursalIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors2.lila,
        justifyContent: "center",
        alignItems: "center",
    },
    sucursalTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    sucursalLabel: {
        fontSize: 12,
        color: "#999",
    },
    sucursalTexto: {
        fontSize: 15,
        fontWeight: "700",
        color: colors2.negro,
        marginTop: 2,
    },

    // Categorías
    categoriasSection: {
        marginTop: 20,
    },
    categoriasTitulo: {
        fontSize: 18,
        fontWeight: "700",
        color: colors2.negro,
        marginLeft: 7,
        marginBottom: 12,
    },
    categoriasLista: {
        paddingHorizontal: 7,
    },
    categoriaItem: {
        alignItems: "center",
        marginRight: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors2.blanco,
        borderRadius: 12,
        minWidth: 80,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    categoriaItemActiva: {
        backgroundColor: colors2.lila,
    },
    categoriaIcono: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0E6F6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    categoriaIconoActivo: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    categoriaTexto: {
        fontSize: 11,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        maxWidth: 70,
    },
    categoriaTextoActivo: {
        color: "#FFF",
    },

    // Búsqueda
    busquedaContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors2.blanco,
        marginHorizontal: 7,
        marginTop: 15,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputBusqueda: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: colors2.negro,
    },

    // Header
    seccionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 15,
        marginHorizontal: 7,
    },
    tituloSeccion: {
        fontSize: 20,
        fontWeight: "800",
        color: colors2.negro,
    },

    // Estados
    estadoContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 30,
    },
    estadoTexto: {
        fontSize: 17,
        color: "#666",
        marginTop: 15,
        fontWeight: "600",
    },
    estadoSubtexto: {
        fontSize: 14,
        color: "#999",
        marginTop: 5,
    },
    errorTexto: {
        fontSize: 16,
        color: "#E74C3C",
        marginTop: 15,
        textAlign: "center",
    },
    botonReintentar: {
        backgroundColor: colors2.lila,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
    },
    textoBoton: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 15,
    },

    // Productos
    productoCard: {
        width: ANCHO_PRODUCTO - 8,
        marginHorizontal: 4,
        marginBottom: 12,
        backgroundColor: colors2.blanco,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imagenWrapper: {
        width: "100%",
        height: 70,
        backgroundColor: colors2.gris,
        position: "relative",
    },
    productoImagen: {
        width: "100%",
        height: "100%",
    },
    agotadoBadge: {
        position: "absolute",
        top: 4,
        left: 4,
        backgroundColor: colors2.rojo,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    agotadoTexto: {
        color: colors2.blanco,
        fontSize: 7,
        fontWeight: "700",
    },
    productoInfo: {
        padding: 6,
    },
    marcaTexto: {
        fontSize: 7,
        fontWeight: "700",
        color: colors2.lila,
        letterSpacing: 0.3,
        marginBottom: 2,
    },
    productoNombre: {
        fontSize: 9,
        fontWeight: "600",
        color: colors2.negro,
        lineHeight: 12,
        height: 24,
    },
    precioRow: {
        marginTop: 4,
    },
    precio: {
        fontSize: 11,
        fontWeight: "800",
        color: "#27AE60",
    },
    moneda: {
        fontSize: 9,
        fontWeight: "600",
        color: colors2.verde,
    },
    agregarBoton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors2.lila,
        paddingVertical: 5,
        borderRadius: 6,
        marginTop: 6,
    },
    agregarBotonDisabled: {
        backgroundColor: colors2.grisOscuro,
    },
    agregarTexto: {
        color: colors2.blanco,
        fontSize: 9,
        fontWeight: "700",
        marginLeft: 3,
    },
    espacioFinal: {
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 10,
    },
    cargandoMasContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
    },
    cargandoMasTexto: {
        marginLeft: 10,
        fontSize: 14,
        color: colors2.lila,
        fontWeight: "600",
    },
    scrollHintTexto: {
        fontSize: 12,
        color: "#999",
        textAlign: "center",
    },

    // Botón volver arriba
    botonVolverArriba: {
        position: "absolute",
        bottom: 100,
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors2.lila,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#8E44AD",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContenido: {
        backgroundColor: colors2.blanco,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "75%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1A1A2E",
    },
    modalCerrar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors2.gris,
        justifyContent: "center",
        alignItems: "center",
    },
    modalLista: {
        padding: 15,
    },
    sucursalItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        backgroundColor: colors2.grisClaro,
    },
    sucursalItemActivo: {
        backgroundColor: colors2.grisOscuro,
        borderWidth: 2,
        borderColor: "#8E44AD",
    },
    sucursalItemIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors2.grisOscuro,
        justifyContent: "center",
        alignItems: "center",
    },
    sucursalItemIconActivo: {
        backgroundColor: colors2.lila,
    },
    sucursalInfo: {
        flex: 1,
        marginLeft: 14,
    },
    sucursalNombre: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },
    sucursalNombreActivo: {
        color: colors2.lila,
        fontWeight: "bold",
    },
    sucursalDireccion: {
        fontSize: 13,
        color: "#999",
        marginTop: 3,
        fontWeight: "bold",
    },
});

export default InicioScreen;
