import React from "react";
import { 
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CuentaScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.contenedor}>
            <View style={styles.iconoContainer}>
                <MaterialCommunityIcons name="account-circle" size={80} color="#8E44AD" />
            </View>
            <Text style={styles.titulo}>Mi Cuenta</Text>
            <Text style={styles.subtitulo}>Gestiona tu perfil y pedidos</Text>
          
            <TouchableOpacity 
                style={styles.boton}
                onPress={() => navigation.navigate("Registro")}
            >
                <MaterialCommunityIcons name="account-plus" size={22} color="#FFF" />
                <Text style={styles.textoBoton}>Crear cuenta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.boton, styles.botonSecundario]}>
                <MaterialCommunityIcons name="login" size={22} color="#8E44AD" />
                <Text style={[styles.textoBoton, styles.textoBotonSecundario]}>Iniciar sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.botonSinCuenta}>
                <Text style={styles.textoSinCuenta}>Continuar sin cuenta</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F6FA",
        paddingHorizontal: 30,
    },
    iconoContainer: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1A1A2E",
    },
    subtitulo: {
        fontSize: 15,
        color: "#999",
        marginTop: 5,
        marginBottom: 40,
    },
    boton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#8E44AD",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 14,
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#8E44AD",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    botonSecundario: {
        backgroundColor: "#FFF",
        borderWidth: 2,
        borderColor: "#8E44AD",
        elevation: 1,
        shadowOpacity: 0.1,
    },
    textoBoton: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 10,
    },
    textoBotonSecundario: {
        color: "#8E44AD",
    },
    botonSinCuenta: {
        marginTop: 20,
        paddingVertical: 10,
    },
    textoSinCuenta: {
        fontSize: 14,
        color: "#999",
        textDecorationLine: "underline",
    },
});

export default CuentaScreen;
