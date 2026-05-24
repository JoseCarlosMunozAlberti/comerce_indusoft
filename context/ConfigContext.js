import React, { createContext, useState, useContext, useEffect } from "react";
import { traerReglaTipo, obtenerListasPrecio, traerSucursales } from "../services/api";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
    const [listaPrecio, setListaPrecio] = useState(2);
    const [listasDisponibles, setListasDisponibles] = useState([1, 2]);
    
    const [sucursal, setSucursal] = useState(1);
    const [sucursales, setSucursales] = useState([]);
    
    const [cargandoConfig, setCargandoConfig] = useState(true);

    useEffect(() => {
        cargarConfiguracion();
    }, []);

    const cargarConfiguracion = async () => {
        try {
            setCargandoConfig(true);
            
            // Cargar reglas y sucursales en paralelo
            const [reglas, listaSucursales] = await Promise.all([
                traerReglaTipo("914001"),
                traerSucursales(),
            ]);
            
            // Configurar listas de precio
            const listas = obtenerListasPrecio(reglas);
            setListasDisponibles(listas);
            if (listas.includes(2)) {
                setListaPrecio(2);
            } else if (listas.length > 0) {
                setListaPrecio(listas[0]);
            }
            
            // Configurar sucursales
            if (listaSucursales && listaSucursales.length > 0) {
                setSucursales(listaSucursales);
                setSucursal(listaSucursales[0].ipalcodi);
            }
            
        } catch (error) {
            console.error("Error al cargar configuración");
            setListasDisponibles([1, 2]);
            setListaPrecio(2);
        } finally {
            setCargandoConfig(false);
        }
    };

    const cambiarSucursal = (codigo) => {
        setSucursal(codigo);
    };

    const obtenerNombreSucursal = () => {
        const suc = sucursales.find(s => s.ipalcodi === sucursal);
        return suc ? suc.ipalnomb : "Sucursal";
    };

    return (
        <ConfigContext.Provider value={{
            listaPrecio,
            listasDisponibles,
            sucursal,
            sucursales,
            cambiarSucursal,
            obtenerNombreSucursal,
            cargandoConfig,
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfig debe usarse dentro de ConfigProvider");
    }
    return context;
}
