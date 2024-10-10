let fichajes = [];
let tipoJornada = "9h";
const horasJornada9h = 9;
const horasJornada6h = 6;
const descansoObligatorio = 30 * 60 * 1000; // 30 minutos en milisegundos

// Evento cuando se cambia el tipo de jornada
document.getElementById("tipoJornada").addEventListener("change", (e) => {
    tipoJornada = e.target.value;
    actualizarTiempoRestante();
});

// Función para obtener la hora manual (si se introduce)
function obtenerHoraManual() {
    const horaManual = document.getElementById("horaManual").value;
    if (horaManual) {
        const [horas, minutos] = horaManual.split(":");
        const ahora = new Date();
        ahora.setHours(horas);
        ahora.setMinutes(minutos);
        ahora.setSeconds(0);
        return ahora;
    }
    return new Date(); // Si no se selecciona manualmente, usa la hora actual
}

// Fichar entrada
function fichajeEntrada() {
    const ahora = obtenerHoraManual();
    fichajes.push({ tipo: "entrada", hora: ahora });
    console.log(`Entrada: ${ahora}`);
    agregarFilaATabla("entrada", ahora);
    actualizarTiempoRestante();
}

// Fichar salida
function fichajeSalida() {
    const ahora = obtenerHoraManual();
    fichajes.push({ tipo: "salida", hora: ahora });
    console.log(`Salida: ${ahora}`);
    agregarFilaATabla("salida", ahora);
    actualizarTiempoRestante();
}

// Calcular tiempo trabajado en base a los fichajes de entrada y salida
function calcularTiempoTrabajado() {
    let tiempoTrabajado = 0;
    let ultimaEntrada = null;

    fichajes.forEach(fichaje => {
        if (fichaje.tipo === "entrada") {
            ultimaEntrada = fichaje.hora;
        } else if (fichaje.tipo === "salida" && ultimaEntrada) {
            tiempoTrabajado += fichaje.hora - ultimaEntrada;
            ultimaEntrada = null; // reiniciar
        }
    });

    // Si el último fichaje es de entrada, contamos el tiempo hasta ahora
    if (ultimaEntrada) {
        tiempoTrabajado += new Date() - ultimaEntrada;
    }

    return tiempoTrabajado;
}

// Calcular tiempo de descanso en base a los fichajes de entrada y salida
function calcularTiempoDescanso() {
    let tiempoDescanso = 0;
    let ultimaSalida = null;

    fichajes.forEach(fichaje => {
        if (fichaje.tipo === "salida") {
            ultimaSalida = fichaje.hora;
        } else if (fichaje.tipo === "entrada" && ultimaSalida) {
            tiempoDescanso += fichaje.hora - ultimaSalida;
            ultimaSalida = null; // reiniciar
        }
    });

    return tiempoDescanso;
}

// Actualizar tiempo restante y de descanso
function actualizarTiempoRestante() {
    const tiempoTrabajado = calcularTiempoTrabajado();
    const tiempoDescanso = calcularTiempoDescanso();

    let horasJornada = tipoJornada === "9h" ? horasJornada9h : horasJornada6h;
    let tiempoRestante = (horasJornada * 60 * 60 * 1000) - tiempoTrabajado;

    // Si la jornada es de 9h, restar el descanso obligatorio si no se ha cumplido
    if (tipoJornada === "9h" && tiempoDescanso < descansoObligatorio) {
        tiempoRestante -= (descansoObligatorio - tiempoDescanso);
    }

    document.getElementById("tiempoRestante").textContent = `Tiempo restante: ${msATiempo(tiempoRestante)}`;
    document.getElementById("tiempoDescanso").textContent = `Tiempo de descanso: ${msATiempo(tiempoDescanso)}`;
}

// Convertir milisegundos a formato de horas, minutos y segundos
function msATiempo(ms) {
    const horas = Math.floor(ms / (1000 * 60 * 60));
    const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((ms % (1000 * 60)) / 1000);
    return `${horas}h ${minutos}m ${segundos}s`;
}

// Función para mostrar el reloj en tiempo real
function mostrarReloj() {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    document.getElementById("reloj").textContent = `${horas}:${minutos}:${segundos}`;
}

// Actualizar reloj y tiempo restante cada segundo
function actualizarEnTiempoReal() {
    mostrarReloj();
    actualizarTiempoRestante();
}

// Ejecutar cada segundo para mantener el reloj y tiempo restante actualizados
setInterval(actualizarEnTiempoReal, 1000);

// Función para agregar una fila a la tabla de fichajes
function agregarFilaATabla(tipo, hora) {
    const tabla = document.getElementById("tablaFichajes").getElementsByTagName('tbody')[0];
    const nuevaFila = tabla.insertRow();

    const celdaTipo = nuevaFila.insertCell(0);
    celdaTipo.textContent = tipo;

    const celdaHora = nuevaFila.insertCell(1);
    celdaHora.textContent = hora.toLocaleTimeString();

    const celdaAccion = nuevaFila.insertCell(2);
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = "Eliminar";
    botonEliminar.onclick = () => {
        const indice = Array.from(tabla.rows).indexOf(nuevaFila);
        eliminarFichaje(indice - 1); // Restar 1 porque el índice incluye el encabezado de la tabla
    };
    celdaAccion.appendChild(botonEliminar);
}

// Eliminar un fichaje de la lista y actualizar la tabla
function eliminarFichaje(indice) {
    fichajes.splice(indice, 1); // Eliminar el fichaje del array
    actualizarTabla();
    actualizarTiempoRestante(); // Recalcular tiempo restante
}
// Actualizar la tabla de fichajes después de eliminar uno
function actualizarTabla() {
    const tabla = document.getElementById("tablaFichajes").getElementsByTagName('tbody')[0];
    tabla.innerHTML = ""; // Limpiar la tabla
    fichajes.forEach((fichaje, index) => {
        agregarFilaATabla(fichaje.tipo, fichaje.hora);
    });
}

// Función para agregar una fila a la tabla de fichajes
function agregarFilaATabla(tipo, hora) {
    const tabla = document.getElementById("tablaFichajes").getElementsByTagName('tbody')[0];
    const nuevaFila = tabla.insertRow();

    const celdaTipo = nuevaFila.insertCell(0);
    celdaTipo.textContent = tipo;

    const celdaHora = nuevaFila.insertCell(1);
    celdaHora.textContent = hora.toLocaleTimeString();

    const celdaAccion = nuevaFila.insertCell(2);
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = "Eliminar";
    botonEliminar.onclick = () => {
        const indice = Array.from(tabla.rows).indexOf(nuevaFila);
        eliminarFichaje(indice - 1); // Restar 1 porque el índice incluye el encabezado de la tabla
    };
    celdaAccion.appendChild(botonEliminar);
}

// Eliminar un fichaje de la lista y actualizar la tabla
function eliminarFichaje(indice) {
    fichajes.splice(indice, 1); // Eliminar el fichaje del array
    actualizarTabla();
    actualizarTiempoRestante(); // Recalcular el tiempo restante
}

// Función para eliminar todos los fichajes
function eliminarTodosLosFichajes() {
    // Vaciar el array de fichajes
    fichajes = [];
    // Limpiar el localStorage
    localStorage.removeItem("fichajes");
    // Actualizar la tabla
    actualizarTabla();
}

// Asociar la función al botón de eliminar todos los registros
document.getElementById("botonEliminarTodos").addEventListener("click", eliminarTodosLosFichajes);

// Actualizar la tabla de fichajes después de eliminar todos
function actualizarTabla() {
    const tabla = document.getElementById("tablaFichajes").getElementsByTagName('tbody')[0];
    tabla.innerHTML = ""; // Limpiar la tabla
    fichajes.forEach((fichaje) => {
        agregarFilaATabla(fichaje.tipo, fichaje.hora);
    });
}
