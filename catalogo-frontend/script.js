// script.js

// 1. CONFIGURACIÓN
const API_URL = 'http://127.0.0.1:5000/api/repuestos'; // Usamos la IP local 127.0.0.1
const TELEFONO_WHATSAPP = "573142379754"; // Tu número de contacto real

// 2. REFERENCIAS AL DOM
const contenedor = document.getElementById('contenedor-repuestos');
const buscador = document.getElementById('buscador');

// 3. FUNCIÓN PARA FORMATEAR PRECIO (Pesos Colombianos)
const formatoMoneda = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// 4. FUNCIÓN PARA GENERAR LA TARJETA HTML
function generarTarjetaHTML(producto) {
    // Usamos 'onerror' para que si la imagen de placeholder falla, muestre un texto simple.
    return `
        <div class="col-md-4 mb-4">
            <div class="card card-repuesto h-100">
                <img src="${producto.imagen}" class="card-img-top" onerror="this.onerror=null;this.src='https://placehold.co/300x200/505050/ffffff?text=No+Imagen';" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text text-muted mb-1"><strong>SKU:</strong> ${producto.sku}</p>
                    <p class="card-text small">Compatible: ${producto.modelos}</p>
                    <h5 class="text-primary mt-auto mb-3">${formatoMoneda.format(producto.precio)}</h5>
                    
                    <button class="btn btn-success w-100" 
                            onclick="enviarWhatsapp('${producto.nombre}', '${producto.sku}')">
                        <i class="fab fa-whatsapp"></i> Cotizar / Comprar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 5. FUNCIÓN PRINCIPAL: Renderizar los productos
function mostrarProductos(lista) {
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center text-muted"><h3>No se encontraron repuestos con ese criterio.</h3></div>';
        return;
    }

    let htmlContenido = '';
    lista.forEach(producto => {
        htmlContenido += generarTarjetaHTML(producto);
    });
    contenedor.innerHTML = htmlContenido;
}

// 6. FUNCIÓN DE CONEXIÓN A LA API Y FILTRADO
async function cargarYFiltrarProductos() {
    const texto = buscador.value;
    
    try {
        // Muestra un mensaje de carga
        contenedor.innerHTML = '<div class="col-12 text-center text-muted"><h4>Cargando catálogo...</h4></div>';

        // Petición HTTP a la API de Flask, enviando el texto de búsqueda
        const response = await fetch(`${API_URL}?search=${encodeURIComponent(texto)}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const repuestosFiltrados = await response.json();
        
        // Renderizamos los productos recibidos
        mostrarProductos(repuestosFiltrados); 
    } catch (error) {
        console.error("Fallo de conexión o API:", error);
        // Muestra un mensaje amigable si falla la conexión
        contenedor.innerHTML = `
            <div class="col-12 text-center text-danger">
                <h4>⚠️ El catálogo no está disponible.</h4>
                <p>Asegúrate de que el servidor Flask esté activo en tu terminal.</p>
            </div>`;
    }
}

// 7. FUNCIÓN DE WHATSAPP (Necesaria para el evento 'onclick' en el HTML)
window.enviarWhatsapp = function(nombreProducto, sku) {
    const mensaje = `Hola, me interesa el repuesto: *${nombreProducto}* con SKU: *${sku}*. ¿Está disponible?`;
    const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
}

// 8. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', cargarYFiltrarProductos);
buscador.addEventListener('input', cargarYFiltrarProductos);