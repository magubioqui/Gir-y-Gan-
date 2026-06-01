// REEMPLAZA las letras de abajo con la URL de tu Google Sheets
const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycbwdaIilBbmjdlx0p1PtWEPJpg-VWBf5RiASKaA2ePyf9mTHMlILgQJupCRgtrPCaVQcoA/exec';

// ORDEN EXACTO DE TU IMAGEN (Empezando desde el gajo de la flecha en sentido horario)
const opciones = [
    "Uff...", 
    "10% Off", 
    "Seguí Participando", 
    "3 x 2 selecc.", 
    "10% Off", 
    "2 x 1 selecc.", 
    "Uff...", 
    "10% Off", 
    "25% Off Prox/Com.", 
    "¡Felicidades!...", 
    "10% Off", 
    "50% Off en 2da"
];

// COLORES EXACTOS HEX EN EL MISMO ORDEN DE LOS GAJOS
const colores = [
    '#b56618', // Uff...
    '#ded4cc', // 10% Off
    '#8a1e1e', // Seguí Participando
    '#be986b', // 3 x 2 selecc.
    '#ded4cc', // 10% Off
    '#be986b', // 2 x 1 selecc.
    '#b56618', // Uff...
    '#ded4cc', // 10% Off
    '#be986b', // 25% Off Prox/Com.
    '#3b7a3b', // ¡Felicidades!...
    '#ded4cc', // 10% Off
    '#be986b'  // 50% Off en 2da
];

// PROBABILIDADES ASIGNADAS PARA CADA UNO DE LOS 12 SECTORES (La suma total da exactamente 100)
const probabilidades = [
    10, // Uff... -> 10%
    10, // 10% Off -> 10%
    20, // Seguí Participando -> 20%
    10, // 3 x 2 selecc. -> 10%
    10, // 10% Off -> 10%
    10, // 2 x 1 selecc. -> 10%
    10, // Uff... -> 10%
    10, // 10% Off -> 10%
    4,  // 25% Off Prox/Com. -> 4%
    1,  // ¡Felicidades!... -> 1%
    3,  // 10% Off -> 3%
    2   // 50% Off en 2da -> 2%
];

// TEXTO PERSONALIZADO PARA LOS CARTELES DE DIÁLOGO
const aclaraciones = {
    "10% Off": "EN EL INSTANTE",
    "Seguí Participando": "La próxima vez será",
    "3 x 2 selecc.": "EN SELECCIONADOS",
    "2 x 1 selecc.": "EN SELECCIONADOS",
    "Uff...": "Probá una vez más",
    "25% Off Prox/Com.": "SIGUIENTE COMPRA (SELECCIONADOS)",
    "¡Felicidades!...": "¡Ganaste un premio!",
    "50% Off en 2da": "VÁLIDO EN EL INSTANTE"
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const numOpciones = opciones.length;
const anguloArco = 2 * Math.PI / numOpciones;
let anguloInicio = 0;
let yaGiro = false;
let indiceGanadorSeleccionado = 0;

function dibujarRuleta() {
    const centro = 180;
    ctx.clearRect(0, 0, 360, 360);
    for (let i = 0; i < numOpciones; i++) {
        // Renderizado ordenado según la orientación de la foto original
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
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(opciones[i], centro - 25, 5);
        ctx.restore();
    }
}

function validarYEnviar(event) {
    event.preventDefault();
    const btnRegistro = document.getElementById('btn-registro');
    btnRegistro.disabled = true;
    btnRegistro.innerText = "Registrando...";

    const nombre = document.getElementById('nombre').value;
    const phone = document.getElementById('telefono').value;

    fetch(URL_GOOGLE_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, telefono: phone })
    })
    .then(() => {
        document.getElementById('nombre-usuario').innerText = nombre;
        document.getElementById('seccion-registro').style.display = 'none';
        document.getElementById('seccion-ruleta').style.display = 'block';
        dibujarRuleta();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error. Intenta ingresar de nuevo.');
        btnRegistro.disabled = false;
        btnRegistro.innerText = "INGRESAR AHORA";
    });
}

function elegirIndiceGanador() {
    const random = Math.random() * 100;
    let suma = 0;
    for (let i = 0; i < numOpciones; i++) {
        suma += probabilidades[i];
        if (random <= suma) return i;
    }
    return 0;
}

function comenzarGiro() {
    if (yaGiro) return;
    yaGiro = true;
    document.getElementById('btn-gira-ruleta').disabled = true;

    indiceGanadorSeleccionado = elegirIndiceGanador();

    // Lógica física para forzar la frenada fluida en la flecha de la derecha
    const vueltasCompletas = 6 * 2 * Math.PI; 
    const anguloDestino = (2 * Math.PI) - (indiceGanadorSeleccionado * anguloArco) - (anguloArco / 2);
    const anguloFinalTotal = vueltasCompletas + anguloDestino;

    let paso = 0;
    const pasosTotales = 250;

    function animar() {
        paso++;
        const progreso = 1 - Math.pow(1 - (paso / pasosTotales), 3);
        anguloInicio = progreso * anguloFinalTotal;
        dibujarRuleta();

        if (paso < pasosTotales) {
            requestAnimationFrame(animar);
        } else {
            const premioGanado = opciones[indiceGanadorSeleccionado];
            const aclaracionPremio = aclaraciones[premioGanado] || "";
            document.getElementById('modal-premio').innerText = premioGanado;
            document.getElementById('modal-aclaracion').innerText = aclaracionPremio;
            document.getElementById('miModal').style.display = 'flex';
        }
    }
    animar();
}

function cerrarModal() {
    document.getElementById('miModal').style.display = 'none';
}
