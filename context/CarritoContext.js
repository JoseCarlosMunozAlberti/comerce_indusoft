import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CarritoContext = createContext();

const STORAGE_KEY = "carrito_data";
const EXPIRACION_KEY = "carrito_expiracion";
const DIAS_EXPIRACION = 7;

export function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState([]);
    const [cargandoCarrito, setCargandoCarrito] = useState(true);

    useEffect(() => {
        cargarCarritoGuardado();
    }, []);

    useEffect(() => {
        if (!cargandoCarrito) {
            guardarCarrito(carrito);
        }
    }, [carrito, cargandoCarrito]);

    const cargarCarritoGuardado = async () => {
        try {
            const expiracionStr = await AsyncStorage.getItem(EXPIRACION_KEY);
            
            if (expiracionStr) {
                const expiracion = new Date(expiracionStr);
                const ahora = new Date();
                
                if (ahora > expiracion) {
                    await AsyncStorage.multiRemove([STORAGE_KEY, EXPIRACION_KEY]);
                } else {
                    const carritoGuardado = await AsyncStorage.getItem(STORAGE_KEY);
                    if (carritoGuardado) {
                        setCarrito(JSON.parse(carritoGuardado));
                    }
                }
            }
        } catch (error) {
            console.error("Error al cargar carrito");
        } finally {
            setCargandoCarrito(false);
        }
    };

    const guardarCarrito = async (nuevoCarrito) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoCarrito));
            
            const expiracion = new Date();
            expiracion.setDate(expiracion.getDate() + DIAS_EXPIRACION);
            await AsyncStorage.setItem(EXPIRACION_KEY, expiracion.toISOString());
        } catch (error) {
            console.error("Error al guardar carrito");
        }
    };

    const agregarAlCarrito = (producto, cantidad = 1) => {
        const existe = carrito.find(item => item.id === producto.id);
        
        if (!existe) {
            setCarrito([...carrito, { ...producto, cantidad }]);
        } else {
            setCarrito(carrito.map(item => 
                item.id === producto.id 
                    ? { ...item, cantidad: item.cantidad + cantidad }  
                    : item 
            ));
        }
    };

    const quitarDelCarrito = (productoId) => {
        const existe = carrito.find(item => item.id === productoId);
        
        if (!existe) return;
        
        if (existe.cantidad === 1) {
            setCarrito(carrito.filter(item => item.id !== productoId));
        } else {
            setCarrito(carrito.map(item =>
                item.id === productoId
                    ? { ...item, cantidad: item.cantidad - 1 }
                    : item
            ));
        }
    };

    const eliminarDelCarrito = (productoId) => {
        setCarrito(carrito.filter(item => item.id !== productoId));
    };

    const vaciarCarrito = async () => {
        setCarrito([]);
        try {
            await AsyncStorage.multiRemove([STORAGE_KEY, EXPIRACION_KEY]);
        } catch (error) {
            console.error("Error al vaciar carrito");
        }
    };

    const contarProductos = () => {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    const obtenerCantidadEnCarrito = (productoId) => {
        const item = carrito.find(p => p.id === productoId);
        return item ? item.cantidad : 0;
    };

    return (
        <CarritoContext.Provider value={{
            carrito,           
            agregarAlCarrito,  
            quitarDelCarrito,
            eliminarDelCarrito,  
            vaciarCarrito,     
            contarProductos,   
            calcularTotal,
            obtenerCantidadEnCarrito,
            cargandoCarrito,     
        }}>
            {children}
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error("useCarrito debe usarse dentro de CarritoProvider");
    }
    return context;
}
