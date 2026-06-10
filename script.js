const WHATSAPP_NUMBER = "5511999999999";
const form = document.getElementById('contractForm');
const canvas = document.getElementById('canvasAssinatura');
const ctx = canvas.getContext('2d');
const progressBar = document.getElementById('progress');
let drawing = false;

// --- CONFIGURAÇÃO INICIAL ---
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

// --- LOGIN (Formulário e Admin) ---
// A senha "123" em Base64 é "MTIz". Para mudar, use btoa("suasenha")
function loginAdmin() {
    const pass = document.getElementById('adminPass').value;
    if (btoa(pass) === "MTIz") {
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('formWrapper').classList.remove('hidden');
        document.getElementById('converterSection').classList.remove('hidden');
    } else {
        alert("Senha incorreta!");
    }
}

// --- PAINEL ADMIN (Conversor) ---
function converterBase64() {
    const code = document.getElementById('b64Input').value;
    const output = document.getElementById('resultOutput');
    output.innerHTML = `<img src="${code}" style="max-width:300px; border: 1px solid #000;">`;
}

// --- MÁSCARA CPF ---
document.getElementById('cpf').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = val;
});

// --- FLUXO DO FORMULÁRIO ---
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

document.getElementById('btnWhatsApp').onclick = () => {
    if (!form.nome.value) return alert("Preencha seu nome primeiro.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Olá, gostaria de receber meu contrato. Nome: ${form.nome.value}`, '_blank');
};

document.getElementById('btnAssinar').onclick = () => {
    if (document.getElementById('termos').checked) {
        document.getElementById('areaAssinatura').classList.remove('hidden');
        progressBar.style.width = "75%";
    } else {
        alert("Você precisa confirmar que leu o contrato.");
    }
};

// --- CANVAS (Desenho) ---
function startDrawing(e) { drawing = true; ctx.beginPath(); }
function stopDrawing() { drawing = false; }
function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
}
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

document.getElementById('btnLimpar').onclick = desenharLinhaGuia;

// --- ENVIO WEB3FORMS ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('assinaturaBase64').value = canvas.toDataURL('image/png');
    
    const btnEnviar = document.getElementById('btnEnviar');
    btnEnviar.innerText = "Enviando...";
    progressBar.style.width = "100%";

    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
    });

    if (response.ok) {
        document.querySelector('.container').innerHTML = `<h2>✓ Sucesso!</h2><p>Contrato enviado.</p>`;
    } else {
        alert("Erro no envio.");
        btnEnviar.innerText = "Enviar";
    }
});
