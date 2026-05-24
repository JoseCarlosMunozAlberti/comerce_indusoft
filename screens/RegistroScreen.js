import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { registrarCliente } from "../services/api";
import { useConfig } from "../context/ConfigContext";

const RegistroScreen = () => {
    const navigation = useNavigation();
    const { sucursal } = useConfig();

    const [formulario, setFormulario] = useState({
        nombre: "",
        telefono: "",
        nit: "",
        email: "",
        contrasena: "",
        confirmarContrasena: "",
    });
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errores, setErrores] = useState({});

    const actualizarCampo = (campo, valor) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: null }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formulario.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es requerido";
        } else if (formulario.nombre.trim().length < 3) {
            nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
        }

        if (!formulario.telefono.trim()) {
            nuevosErrores.telefono = "El teléfono es requerido";
        } else if (!/^\d{7,15}$/.test(formulario.telefono.trim())) {
            nuevosErrores.telefono = "Ingresa un teléfono válido";
        }

        if (!formulario.email.trim()) {
            nuevosErrores.email = "El correo es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email.trim())) {
            nuevosErrores.email = "Ingresa un correo válido";
        }

        if (!formulario.contrasena) {
            nuevosErrores.contrasena = "La contraseña es requerida";
        } else if (formulario.contrasena.length < 6) {
            nuevosErrores.contrasena = "La contraseña debe tener al menos 6 caracteres";
        }

        if (formulario.contrasena !== formulario.confirmarContrasena) {
            nuevosErrores.confirmarContrasena = "Las contraseñas no coinciden";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleRegistro = async () => {
        if (!validarFormulario()) return;

        setCargando(true);
        try {
            const datosCliente = {
                nombre: formulario.nombre.trim().toUpperCase(),
                telefono: formulario.telefono.trim(),
                nit: formulario.nit.trim() || "0",
                email: formulario.email.trim().toLowerCase(),
                contrasena: formulario.contrasena,
                sucursal: sucursal,
            };

            const codigoCliente = await registrarCliente(datosCliente);

            Alert.alert(
                "¡Registro exitoso!",
                `Bienvenido ${datosCliente.nombre}!\n\nTu cuenta ha sido creada correctamente.\nTu código de cliente es: ${codigoCliente}\n\nGuarda este código para futuras referencias.`,
                [
                    {
                        text: "Continuar",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                "Error",
                error.message || "No se pudo completar el registro. Intenta nuevamente."
            );
        } finally {
            setCargando(false);
        }
    };

    const renderCampo = (config) => {
        const { campo, label, placeholder, icono, teclado, esContrasena, maxLength } = config;
        const tieneError = errores[campo];

        return (
            <View style={styles.campoContainer} key={campo}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.inputContainer, tieneError && styles.inputError]}>
                    <MaterialCommunityIcons
                        name={icono}
                        size={22}
                        color={tieneError ? "#E74C3C" : "#8E44AD"}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        value={formulario[campo]}
                        onChangeText={(valor) => actualizarCampo(campo, valor)}
                        keyboardType={teclado || "default"}
                        secureTextEntry={esContrasena && !mostrarContrasena}
                        autoCapitalize={esContrasena || campo === "email" ? "none" : "words"}
                        maxLength={maxLength}
                    />
                    {esContrasena && (
                        <TouchableOpacity onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                            <MaterialCommunityIcons
                                name={mostrarContrasena ? "eye-off" : "eye"}
                                size={22}
                                color="#999"
                            />
                        </TouchableOpacity>
                    )}
                </View>
                {tieneError && (
                    <Text style={styles.errorTexto}>{tieneError}</Text>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.botonVolver}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <View style={styles.iconoContainer}>
                        <MaterialCommunityIcons name="account-plus" size={50} color="#FFF" />
                    </View>
                    <Text style={styles.titulo}>Crear Cuenta</Text>
                    <Text style={styles.subtitulo}>
                        Completa tus datos para registrarte
                    </Text>
                </View>

                <View style={styles.formularioContainer}>
                    {renderCampo({
                        campo: "nombre",
                        label: "Nombre completo *",
                        placeholder: "Ej: Juan Pérez",
                        icono: "account",
                    })}

                    {renderCampo({
                        campo: "telefono",
                        label: "Teléfono *",
                        placeholder: "Ej: 70012345",
                        icono: "phone",
                        teclado: "phone-pad",
                        maxLength: 15,
                    })}

                    {renderCampo({
                        campo: "nit",
                        label: "NIT / CI (opcional)",
                        placeholder: "Ej: 12345678",
                        icono: "card-account-details",
                        teclado: "numeric",
                        maxLength: 15,
                    })}

                    {renderCampo({
                        campo: "email",
                        label: "Correo electrónico *",
                        placeholder: "correo@ejemplo.com",
                        icono: "email",
                        teclado: "email-address",
                    })}

                    {renderCampo({
                        campo: "contrasena",
                        label: "Contraseña *",
                        placeholder: "Mínimo 6 caracteres",
                        icono: "lock",
                        esContrasena: true,
                    })}

                    {renderCampo({
                        campo: "confirmarContrasena",
                        label: "Confirmar contraseña *",
                        placeholder: "Repite tu contraseña",
                        icono: "lock-check",
                        esContrasena: true,
                    })}

                    <TouchableOpacity
                        style={[styles.botonRegistrar, cargando && styles.botonDeshabilitado]}
                        onPress={handleRegistro}
                        disabled={cargando}
                    >
                        {cargando ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="account-check" size={22} color="#FFF" />
                                <Text style={styles.botonTexto}>Crear cuenta</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginTexto}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.loginLink}>Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 30,
    },
    botonVolver: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    iconoContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#8E44AD",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        elevation: 4,
        shadowColor: "#8E44AD",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    titulo: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1A1A2E",
    },
    subtitulo: {
        fontSize: 15,
        color: "#666",
        marginTop: 5,
    },
    formularioContainer: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    campoContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E8E8E8",
    },
    inputError: {
        borderColor: "#E74C3C",
        backgroundColor: "#FFF5F5",
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: "#333",
    },
    errorTexto: {
        fontSize: 12,
        color: "#E74C3C",
        marginTop: 5,
        marginLeft: 5,
    },
    botonRegistrar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8E44AD",
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 10,
        elevation: 3,
        shadowColor: "#8E44AD",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    botonDeshabilitado: {
        backgroundColor: "#CCC",
    },
    botonTexto: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: "700",
        marginLeft: 10,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginTexto: {
        fontSize: 14,
        color: "#666",
    },
    loginLink: {
        fontSize: 14,
        fontWeight: "700",
        color: "#8E44AD",
    },
});

export default RegistroScreen;
