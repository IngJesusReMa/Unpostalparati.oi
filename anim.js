// --- FUNCIONES DE UTILIDAD PARA TIEMPO ---
// Función para convertir una cadena de tiempo (M:SS:MMM o SSS.MMM) a milisegundos
function parseTimeToMilliseconds(timeValue) {
    if (typeof timeValue === 'number') {
        // Si ya es un número (segundos), convertir a milisegundos
        return timeValue * 1000;
    }

    if (typeof timeValue === 'string') {
        const parts = timeValue.split(':');
        let totalMilliseconds = 0;

        if (parts.length === 3) { // Formato M:SS:MMM (ej. "0:17:012")
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            const milliseconds = parseInt(parts[2], 10);
            totalMilliseconds = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
        } else if (parts.length === 2) { // Asumimos M:SS (ej. "0:17") o SS:MMM (ej. "17:012")
            // Para ser robusto, asumiremos que si hay dos partes y la segunda es pequeña, son milisegundos
            // De lo contrario, son minutos y segundos.
            if (parts[1].length === 3 && parts[0].length <= 2) { // ej. "17:012" (segundos:milisegundos)
                 const seconds = parseInt(parts[0], 10);
                 const milliseconds = parseInt(parts[1], 10);
                 totalMilliseconds = (seconds * 1000) + milliseconds;
            } else { // ej. "0:17" (minutos:segundos)
                const minutes = parseInt(parts[0], 10);
                const seconds = parseInt(parts[1], 10);
                totalMilliseconds = (minutes * 60 * 1000) + (seconds * 1000);
            }
        } else if (parts.length === 1) { // Formato S o S.MMM (ej. "17" o "17.012")
            totalMilliseconds = parseFloat(parts[0]) * 1000;
        }
        return totalMilliseconds;
    }
    return 0; // Valor por defecto si el formato no es reconocido
}


// --- SINCRONIZACIÓN DE LETRAS ---
var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");

// Array de objetos que contiene cada línea y su tiempo de aparición
// Primero, procesamos todos los tiempos a milisegundos para una comparación consistente
var lyricsData = [
    { text: "♫ Imagina cuántas veces ♫", time: "0:18:10" }, // M:SS:MMM
    { text: "♫ Yo le pregunté a la suerte ♫", time: "0:22:10" },    
    { text: "♫ Si algún día entendería ♫", time: "0:24:10" },
    { text: "♫ Lo que significa el amor ♫", time: "0:28:00" },
    { text: "♫ Tanto lo deseaba ♫", time: "0:33:00" },
    { text: "♫ Tanto lo necesitaba ♫", time: "0:38:00" },
    { text: "♫ Te pedí como un milagro ♫", time: "0:41:00" },
    { text: "♫ Y la fe me hizo buscarte ♫", time: "0:44:00" },
    { text: "♫ Todo el recorrido ♫", time: "0:48:00" },
    { text: "♫ Volvería a vivirlo ♫", time: "0:52:00" },
    { text: "♫ ¿Qué significa amor? ♫", time: "0:57:00" },
    { text: "♫ ¿Qué significa el amor? ♫", time: "0:58:0" },
    { text: "♫ ¿Qué significa fe? ♫", time: "1:04:00" },
    { text: "♫ ¿Qué significa un milagro? ♫", time: "1:06:00" },
    { text: "♫ Oh-oh-oh-oh-oh ♫", time: "1:12:00" },
    { text: "♫ Oh-oh-oh-uh-oh-oh ♫", time: "1:13:00" },
    { text: "♫ Oh-oh-oh-oh-oh ♫", time: "1:20:00" },
    { text: "♫ Oh-oh-oh-uh-oh ♫", time: "1:22:00" },
    { text: "♫ Y ahora que te tengo a ti ♫", time: "1:27:10" },
    { text: "♫ Puedo ver tus ojos brillar ♫", time: "1:30:00" },
    { text: "♫ Se despejan tantas dudas ♫", time: "1:35:00" },
    { text: "♫ Las respuestas puedo encontrar ♫", time: "1:37:00" },
    { text: "♫ Tú significas amor ♫", time: "1:43:00" },
    { text: "♫ Tú significas el amor ♫", time: "1:43:20" },
    { text: "♫ Tú significas fe ♫", time: "1:51:00" },
    { text: "♫ Tú eres el milagro ♫", time: "1:52:00" },
   
].map(line => ({
    text: line.text,
    time: parseTimeToMilliseconds(line.time) // Convertir todos los tiempos a milisegundos
}));

// Opcional: Ordenar las letras por tiempo para asegurar que se muestren correctamente
lyricsData.sort((a, b) => a.time - b.time);

let currentLineIndex = -1; // Mantener un índice de la línea actual para optimizar la búsqueda

// Animar las letras
function updateLyrics() {
    // Obtener el tiempo actual del audio en milisegundos
    var currentTimeMs = audio.currentTime * 1000;

    // Duración para que la letra se muestre completamente (fadeIn) y permanezca
    const lineDisplayDuration = 5000; // La línea estará visible por 5 segundos
    const fadeInDuration = 500;   // 0.5 segundos para aparecer
    const fadeOutDuration = 500;  // 0.5 segundos para desaparecer

    let foundLine = null;

    // Buscar la línea actual de forma eficiente
    // Iteramos desde la línea actual para ver si avanzamos o retrocedemos (si el usuario adelanta/retrasa)
    for (let i = 0; i < lyricsData.length; i++) {
        const line = lyricsData[i];
        const lineStartTime = line.time;
        const lineEndTime = lineStartTime + lineDisplayDuration; // La línea estará activa por esta duración

        if (currentTimeMs >= lineStartTime && currentTimeMs < lineEndTime) {
            foundLine = line;
            currentLineIndex = i; // Actualizamos el índice de la línea actual
            break; // Salimos del bucle una vez que encontramos la línea
        }
    }

    if (foundLine) {
        // Si es una nueva línea o el texto ha cambiado
        if (lyrics.innerHTML !== foundLine.text) {
            lyrics.innerHTML = foundLine.text;
        }

        // Calcula la opacidad
        let opacity = 0;
        const timeIntoLine = currentTimeMs - foundLine.time;

        if (timeIntoLine < fadeInDuration) {
            // Fase de aparición (fade-in)
            opacity = timeIntoLine / fadeInDuration;
        } else if (timeIntoLine < (lineDisplayDuration - fadeOutDuration)) {
            // Fase de permanencia (totalmente visible)
            opacity = 1;
        } else {
            // Fase de desaparición (fade-out)
            const timeUntilEnd = lineDisplayDuration - timeIntoLine;
            opacity = timeUntilEnd / fadeOutDuration;
        }

        // Aplica el efecto de opacidad
        lyrics.style.opacity = opacity;
    } else {
        // Restablece la opacidad y el contenido si no hay una línea actual
        lyrics.style.opacity = 0;
        lyrics.innerHTML = "";
        // Reinicia el índice si estamos fuera de cualquier línea de tiempo
        if (currentTimeMs < lyricsData[0].time || currentTimeMs > lyricsData[lyricsData.length -1].time + lineDisplayDuration) {
             currentLineIndex = -1;
        }
    }
}

// Usar requestAnimationFrame para una animación más suave y eficiente
// o un setInterval con un tiempo de actualización más bajo
// Usaré setInterval para mantener la estructura original, pero con un intervalo más bajo.
setInterval(updateLyrics, 50); // Actualiza cada 50 milisegundos para mayor fluidez


// --- FUNCIÓN TÍTULO (SIN CAMBIOS SIGNIFICATIVOS) ---
// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
    var titulo = document.querySelector(".titulo");
    if (titulo) { // Asegurarse de que el elemento exista
        titulo.style.animation =
            "fadeOut 3s ease-in-out forwards"; /* Duración y función de temporización de la desaparición */
        setTimeout(function () {
            titulo.style.display = "none";
        }, 3000); // Espera 3 segundos antes de ocultar completamente
    }
}

// Llama a la función después de 216 segundos (216,000 milisegundos)
setTimeout(ocultarTitulo, 216000);