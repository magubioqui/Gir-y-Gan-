// REEMPLAZA las letras de abajo con la URL de tu Google Sheets
const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycbwdaIilBbmjdlx0p1PtWEPJpg-VWBf5RiASKaA2ePyf9mTHMlILgQJupCRgtrPCaVQcoA/exec';

const imagenLogo = new Image();
imagenLogo.src = 'logo.png'; 
imagenLogo.onload = function() { dibujarRuleta(); };

const opciones = [
    "Uff...", "10% Off...", "Seguí Participando", "3x2 En Seleccionados", 
    "10% Off...", "2x1 En Seleccionados", "Uff...", "10% Off...", 
    "25% Off Próxima Compra", "¡Felicidades!", "10% Off...", "50% Off en 2da Unidad"
];

const colores = [
    '#b56618', '#ded4cc', '#8a1e1e', '#be986b', 
    '#ded4cc', '#be986b', '#b56618', '#ded4cc', 
    '#be986b', '#3b7a3b', '#ded4cc', '#be986b'
];

const aclaraciones = {
    "10% Off...": "EN EL INSTANTE",
    "Seguí Participando": "La próxima vez será",
    "3x2 En Seleccionados": "EN SELECCIONADOS",
    "2x1 En Seleccionados": "EN SELECCIONADOS",
    "Uff...": "Probá una vez más",
    "25% Off Próxima Compra": "SIGUIENTE COMPRA (SELECCIONADOS)",
    "¡Felicidades!": "¡Ganaste un premio!",
    "50% Off en 2da Unidad": "VÁLIDO EN EL INSTANTE"
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const numOpciones = opciones.length;
const anguloArco = 2 * Math.PI / numOpciones;
let anguloInicio = 0;
let yaGiro = false;
let premioActual = "";

let nombreUsuario = "";
let telefonoUsuario = "";

function dibujarRuleta() {
    const centro = 180;
    ctx.clearRect(0, 0, 360, 360);
    for (let i = 0; i < numOpciones; i++) {
        const angulo = anguloInicio + (i * anguloArco);
        ctx.fillStyle = colores[i];
        ctx.beginPath();
        ctx.moveTo(centro, centro);
        ctx.arc(centro, centro, centro - 4, angulo, angulo + anguloArco);
        ctx.lineTo(centro, centro);
        ctx.fill();
        
        ctx.save();
        ctx.translate(centro, centro);
        ctx.rotate(angulo + anguloArco / 2);
        ctx.fillStyle = (colores[i] === '#ded4cc') ? '#121212' : '#ffffff';
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(opciones[i], centro - 12, 5);
        ctx.restore();
    }

    // Círculo blanco central con el logo recortado
    ctx.save();
    ctx.beginPath();
    ctx.arc(centro, centro, 55, 0, 2 * Math.PI); 
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
    ctx.clip(); 

    if (imagenLogo.complete && imagenLogo.naturalWidth !== 0) {
        ctx.drawImage(imagenLogo, 125, 125, 110, 110);
    }
    ctx.restore();
}

function validarYEnviar(event) {
    event.preventDefault();
    nombreUsuario = document.getElementById('nombre').value;
    telefonoUsuario = document.getElementById('telefono').value;

    document.getElementById('nombre-usuario').innerText = nombreUsuario;
    document.getElementById('seccion-registro').style.display = 'none';
    document.getElementById('seccion-ruleta').style.display = 'block';
    dibujarRuleta();
}

function comenzarGiro() {
    if (yaGiro) return;
    yaGiro = true;
    document.getElementById('btn-gira-ruleta').disabled = true;

    const indiceGanador = elegirIndiceGanador();

    const vueltasCompletas = 6 * 2 * Math.PI;
    const anguloDestino = (2 * Math.PI) - (indiceGanador * anguloArco) - (anguloArco / 2);
    const anguloFinalTotal = vueltasCompletas + anguloDestino;

    let paso = 0;
    const pasosTotales = 220;

    function animar() {
        paso++;
        const progreso = 1 - Math.pow(1 - (paso / pasosTotales), 3);
        anguloInicio = progreso * anguloFinalTotal;
        dibujarRuleta();

        if (paso < pasosTotales) {
            requestAnimationFrame(animar);
        } else {
            premioActual = opciones[indiceGanador];
            enviarDatosAGoogle(premioActual);

            document.getElementById('modal-premio').innerText = premioActual;
            document.getElementById('modal-aclaracion').innerText = aclaraciones[premioActual] || "";
            document.getElementById('miModal').style.display = 'flex';
        }
    }
    animar();
}

function enviarDatosAGoogle(premio) {
    fetch(URL_GOOGLE_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            nombre: nombreUsuario, 
            telefono: telefonoUsuario,
            premio: premio
        })
    })
    .catch(error => console.error('Error al guardar:', error));
}

function elegirIndiceGanador() {
    // Lista de probabilidades corregida (Suma total = 100%)
    const probabilidades = [8.3, 8.3, 8.3, 8.4, 8.3, 8.3, 8.3, 8.4, 8.3, 8.3, 8.3, 8.5];
    const random = Math.random() * 100;
    let suma = 0;
    for (let i = 0; i < numOpciones; i++) {
        suma += probabilidades[i];
        if (random <= suma) return i;
    }
    return 0;
}

function cerrarModal() {
    document.getElementById('miModal').style.display = 'none';
    if (premioActual === "Uff...") {
        yaGiro = false;
        document.getElementById('btn-gira-ruleta').disabled = false;
        document.getElementById('btn-gira-ruleta').innerText = "¡PROBÁ OTRA VEZ!";
    } else {
        document.getElementById('btn-gira-ruleta').innerText = "¡GRACIAS POR JUGAR!";
    }
}

setTimeout(dibujarRuleta, 100);
