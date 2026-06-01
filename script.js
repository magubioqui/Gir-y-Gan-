// REEMPLAZA las letras de abajo con la URL de tu Google Sheets
const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycbwdaIilBbmjdlx0p1PtWEPJpg-VWBf5RiASKaA2ePyf9mTHMlILgQJupCRgtrPCaVQcoA/exec';

const opciones = [
    "3 x 2 selecc.", "Seguí Participando", "10% Off", "50% Off en 2da", 
    "10% Off", "¡Felicidades!...", "25% Off Prox/Com.", "10% Off", 
    "Uff...", "10% Off", "2x1 selecc."
];

const colores = [
    '#be986b', '#8a1e1e', '#ded4cc', '#be986b', 
    '#ded4cc', '#3b7a3b', '#be986b', '#ded4cc', 
    '#b56618', '#ded4cc', '#be986b'
];

const probabilidades = [10, 20, 10, 2, 10, 1, 2, 10, 15, 10, 10];

const aclaraciones = {
    "10% Off": "EN EL INSTANTE",
    "Seguí Participando": "La próxima vez será",
    "3 x 2 selecc.": "EN SELECCIONADOS",
    "2x1 selecc.": "EN SELECCIONADOS",
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
        const angulo = anguloInicio - (i * anguloArco);
        ctx.fillStyle = colores[i];
        ctx.beginPath();
        ctx.moveTo(centro, centro);
        ctx.arc(centro, centro, centro - 4, angulo - anguloArco, angulo);
        ctx.lineTo(centro, centro);
        ctx.fill();
        
        ctx.save();
        ctx.translate(centro, centro);
        ctx.rotate(angulo - anguloArco / 2);
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
    const telefono = document.getElementById('telefono').value;

    fetch(URL_GOOGLE_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, telefono: telefono })
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

    const vueltasCompletas = 5 * 2 * Math.PI; 
    const anguloObjetivoSector = (indiceGanadorSeleccionado * anguloArco) + (anguloArco / 2);
    const anguloFinalTotal = vueltasCompletas + anguloObjetivoSector;

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
