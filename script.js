const WHATSAPP_NUMBER = "5541988854801";
const form = document.getElementById('contractForm');
const canvas = document.getElementById('canvasAssinatura');
const ctx = canvas.getContext('2d');
const progressBar = document.getElementById('progress');
const hiddenBase64 = document.getElementById('assinaturaBase64');
let drawing = false;

// Estilo do traço
ctx.strokeStyle = "#1a237e";
ctx.lineWidth = 3;

function desenharLinhaGuia() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(350, 150);
    ctx.stroke();
    ctx.strokeStyle = "#1a237e";
    ctx.lineWidth = 3;
}
desenharLinhaGuia();

// --- NOVO: Lógica de Upload de Arquivo ---
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            hiddenBase64.value = event.target.result;
            alert("Assinatura anexada com sucesso!");
        };
        reader.readAsDataURL(file);
    }
});

// --- VALIDAÇÃO E FLUXO ---
function validarCampos() {
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}

document.getElementById('radioNao').onclick = () => {
    document.getElementById('btnWhatsApp').classList.remove('hidden');
    document.getElementById('areaConfirmacao').classList.add('hidden');
    document.getElementById('areaAssinatura').classList.add('hidden');
    progressBar.style.width = "25%";
};

document.getElementById('radioSim').onclick = () => {
    document.getElementById('btnWhatsApp').classList.add('hidden');
    document.getElementById('areaConfirmacao').classList.remove('hidden');
    progressBar.style.width = "50%";
};

document.getElementById('btnAssinar').onclick = () => {
    if (!validarCampos()) return;
    if (!document.getElementById('termos').checked) return alert("Confirme os termos.");
    
    document.getElementById('areaAssinatura').classList.remove('hidden');
    progressBar.style.width = "75%";
};

// --- ENVIO ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    // Se NÃO foi anexado arquivo, pega o desenho do canvas
    if (!hiddenBase64.value) {
        hiddenBase64.value = canvas.toDataURL('image/png');
    }

    const btnEnviar = document.getElementById('btnEnviar');
    btnEnviar.innerText = "Enviando...";
    btnEnviar.disabled = true;
    progressBar.style.width = "100%";

    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
    });

    if (response.ok) {
        document.querySelector('.container').innerHTML = `<h2 style="color: #27ae60; text-align: center;">✓ Sucesso!</h2>`;
    } else {
        alert("Erro no envio.");
        btnEnviar.innerText = "Enviar Assinatura";
        btnEnviar.disabled = false;
    }
});
