const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://190.186.170.114/indusoft/wpollo/api";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "XNLO0Sg0GYsODbXWs5dTjXaY8IgAxyZANbrpKE0KQy/rs9z5rDN1RTws+/ecwl3/zj0OEOhZsowLOMRVvzsd9RZj2kBForR92oUQTkeILEF62DZteCOwuR+r3tLQq0tAD6fm2f1J50MDb7c/x8W/VP7ro+yoJLucyOn6GFZsX6YZoqYZWMEX7AcYM/LSL9ibkUVvh5HzVCf4a+ayYTS4QC+2kbdnZvUjFFfJAMM5NJk4FY1eNtkEL85HDsOA3SHm";
const CLAVE_CIFRADO = "DwJ9@-||-@Fn$10u";

// Funciones auxiliares para cifrado
const textToBytes = (text) => {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
    }
    return bytes;
};

const bytesToBase64 = (bytes) => {
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
};

// Aplicar padding PKCS7
const addPKCS7Padding = (bytes) => {
    const blockSize = 16;
    const padding = blockSize - (bytes.length % blockSize);
    const paddedBytes = [...bytes];
    for (let i = 0; i < padding; i++) {
        paddedBytes.push(padding);
    }
    return paddedBytes;
};

const headers = {
    "Content-Type": "application/json",
    "ApiKey": API_KEY,
};

// Buscar productos con stock por sucursal y categoría
export const buscarProductos = async (busqueda = "", listaPrecio = 2, codAlmacen = 1, codCategoria = 0) => {
    try {
        const response = await fetch(`${BASE_URL}/Inventario/BuscarProductoStock`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                codigoABuscar: busqueda,
                listaPrecio,
                ipdescri: busqueda,
                codAlmacen,
                codCategoria,
            }),
        });

        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};

// Obtener categorías
export const traerCategorias = async () => {
    try {
        const response = await fetch(`${BASE_URL}/Inventario/TraerCategoria/0`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            throw new Error("Error al obtener categorías");
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};

// Obtener sucursales/almacenes
export const traerSucursales = async () => {
    try {
        const response = await fetch(`${BASE_URL}/Inventario/TraerIpalmace`, {
            method: "POST",
            headers,
            body: JSON.stringify({ ipalcodi: 0 }),
        });

        if (!response.ok) {
            throw new Error("Error al obtener sucursales");
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};


export const obtenerUrlImagen = (idProducto, idLista = 1) => {
    const ID_IMAGEN_TEMPORAL = 1; 
    return `${BASE_URL}/inventario/TraerImagenProducto/${ID_IMAGEN_TEMPORAL}/${idLista}`;
};

// Obtener reglas del usuario
export const traerReglaTipo = async (adrutipo = "914001") => {
    try {
        const response = await fetch(`${BASE_URL}/Usuario/TraerReglaTipo`, {
            method: "POST",
            headers,
            body: JSON.stringify({ adrutipo }),
        });

        if (!response.ok) {
            throw new Error("Error al obtener reglas");
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};

// Extraer listas de precio de las reglas
export const obtenerListasPrecio = (reglas) => {
    const reglaLista = reglas.find(r => r.adrucreg === 5);
    
    if (reglaLista?.adruvalo) {
        return reglaLista.adruvalo.split(",").map(n => parseInt(n.trim()));
    }
    
    return [1];
};

// aes-js para cifrado AES (ejecutar: npm install aes-js)
let aesjs = null;
try {
    aesjs = require("aes-js");
} catch (e) {
    console.warn("aes-js no está instalado. Ejecuta: npm install aes-js");
}

// Cifrado AES/ECB/PKCS7 compatible con el backend C#
export const cifrarContrasena = (texto) => {
    if (!aesjs) {
        console.error("aes-js no está instalado. Ejecuta: npm install aes-js");
        throw new Error("El módulo de cifrado no está disponible");
    }
    
    // Preparar la llave: rellenar hasta 16 caracteres y tomar solo los primeros 16
    const llave = CLAVE_CIFRADO.padEnd(16).substring(0, 16);
    const keyBytes = textToBytes(llave);
    
    // Convertir texto a bytes y aplicar padding PKCS7
    const textoBytes = textToBytes(texto);
    const paddedBytes = addPKCS7Padding(textoBytes);
    
    // Cifrar con AES-ECB
    const aesEcb = new aesjs.ModeOfOperation.ecb(keyBytes);
    const encryptedBytes = aesEcb.encrypt(paddedBytes);
    
    // Convertir a Base64
    return bytesToBase64(Array.from(encryptedBytes));
};

// Registrar nuevo cliente
export const registrarCliente = async (datosCliente) => {
    try {
        // Cifrar la contraseña antes de enviar
        const contrasenaCifrada = cifrarContrasena(datosCliente.contrasena);
        
        const response = await fetch(`${BASE_URL}/Cliente/RegistrarCliente`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                vpmcnomb: datosCliente.nombre,
                vpmctelf: datosCliente.telefono,
                vpmcnnit: datosCliente.nit || "",
                vpmcemai: datosCliente.email,
                vcitcomp: "",
                vpmcnsuc: datosCliente.sucursal || 1,
                contrasena: contrasenaCifrada,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || "Error al registrar cliente");
        }

        // La respuesta es el código de cliente generado (ej: 719)
        const codigoCliente = await response.json();
        return codigoCliente;
    } catch (error) {
        throw error;
    }
};

// Construir el JSON del pedido desde el carrito
export const construirPedido = (carrito, cliente, config) => {
    const { sucursal, listaPrecio } = config;
    
    // Calcular totales
    const importeTotal = carrito.reduce(
        (total, item) => total + (item.precio * item.cantidad), 
        0
    );
    
    // Construir detalle de productos
    const lvpdventa = carrito.map((item, index) => ({
        vpdvncor: index + 1,
        vpdvcant: item.cantidad,
        vpdvpreu: item.precio,
        vpdvimbr: item.precio * item.cantidad,
        vpdvimne: item.precio * item.cantidad,
        descripcion: item.nombre,
        vpdvcodi: item.id,
        vpdvimdp: 0.00,
        vpdvckit: 0,
        personalizado: 0,
        glosaPorPorducto: "",
    }));
    
    // Estructura completa del pedido
    return {
        vphvtdoc: 201001,
        vphvndoc: 0,
        vphvfdoc: new Date().toISOString(),
        vphvesta: 901001,
        vphvnref: 0,
        vphvcalm: sucursal,
        vphvccli: cliente.codigo,
        vphvnomb: cliente.nombre,
        vphvnnit: cliente.nit || "0",
        vphvfopa: 915001,
        vphvvend: 0,
        vphvlist: listaPrecio,
        vphvfoen: 916001,
        vphvmone: 912001,
        vphvtipc: 1.00,
        vphvimbr: importeTotal,
        vphvimdt: 0.00,
        vphvimdp: 0.00,
        vphvimne: importeTotal,
        vphvtipo: 906001,
        vphvccon: "",
        vphvglos: "",
        vphvcomp: "0",
        vphvmoti: 1,
        vphvmesa: 0,
        vphvdt1d: "",
        vphvdt2d: "",
        vphvdt3d: 0,
        vphvdt4d: 0,
        vphvdt5d: 0,
        vphvdt6d: 0,
        vphvdt7d: "1900-01-01T00:00:00",
        vphvdt8d: "1900-01-01T00:00:00",
        lvpdventa,
        examoefe: {
            exeftdoc: 0,
            exefndoc: 0,
            exeffdoc: "0001-01-01T00:00:00",
            exefimpo: importeTotal,
            exefvuel: 0.00,
            exefcomn: importeTotal,
            exefcous: 0.0,
        },
        examonqr: {
            exqrtdoc: 0,
            exqrndoc: 0,
            exqrfdoc: "0001-01-01T00:00:00",
            exqrbanc: 0,
            exqrmone: 0,
            exqrimpo: 0,
            exqrdat1: 0,
            exqrdat2: 0,
            exqrdat3: null,
            exqrdat4: "0001-01-01T00:00:00",
        },
        examotar: {
            extatdoc: 0,
            extandoc: 0,
            extafdoc: "0001-01-01T00:00:00",
            extafila: 0,
            extaemis: 0,
            extabanc: 0,
            extatipo: 0,
            extantar: null,
            extanrci: null,
            extamone: 0,
            extaimpo: 0,
        },
    };
};

// Cliente de prueba (código 722 - usuario real en BD)
// TODO: Reemplazar con datos del login cuando esté implementado
export const CLIENTE_PRUEBA = {
    codigo: 722,
    nombre: "PAULO",
    nit: "12233445",
    telefono: "78108416",
    email: "josecarlosmunozalberti@gmail.com",
};

// Generar pedido/venta
export const generarPedido = async (datosPedido) => {
    try {
        const response = await fetch(`${BASE_URL}/Venta/GenerarPedido`, {
            method: "POST",
            headers,
            body: JSON.stringify(datosPedido),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || "Error al generar pedido");
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};
