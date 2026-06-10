const WHATSAPP_NUMBER = "5541988854801"; // Substitua pelo seu número
const form = document.getElementById('contractForm');
const canvas = document.getElementById('canvasAssinatura');
const ctx = canvas.getContext('2d');
const progressBar = document.getElementById('progress');
let drawing = false;

// Configuração do estilo do traço (Azul escuro profissional)
ctx.strokeStyle = "#1a237e"; 
ctx.lineWidth = 3; 

// Desenha a linha guia no Canvas
function desenharLinhaGuia() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(350, 150);
    ctx.stroke();
    // Restaura estilo para assinatura
    ctx.strokeStyle = "#1a237e";
    ctx.lineWidth = 3;
}
desenharLinhaGuia();

// Máscara CPF
document.getElementById('cpf').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = val;
});

// Lógica de Fluxo (Sim/Não)
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

// Botão de WhatsApp
document.getElementById('btnWhatsApp').onclick = () => {
    if (!form.nome.value) return alert("Por favor, preencha seu nome primeiro.");
    const msg = `Olá, meu nome é ${form.nome.value}. Gostaria de receber meu contrato.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Prosseguir para Assinatura
document.getElementById('btnAssinar').onclick = () => {
    if (document.getElementById('termos').checked) {
        document.getElementById('areaAssinatura').classList.remove('hidden');
        progressBar.style.width = "75%";
    } else {
        alert("Você precisa confirmar que leu o contrato.");
    }
};

// Canvas - Desenho (Mouse e Touch)
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

document.getElementById('btnLimpar').onclick = () => {
    desenharLinhaGuia();
};

// Envio via Web3Forms
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Converte assinatura para Base64
    const dataUrl = canvas.toDataURL('image/png');
    document.getElementById('assinaturaBase64').value = dataUrl;

    const btnEnviar = document.getElementById('btnEnviar');
    btnEnviar.innerText = "Enviando...";
    btnEnviar.disabled = true;
    progressBar.style.width = "100%";

    const formData = new FormData(form);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.querySelector('.container').innerHTML = `
                <div style="text-align:center; padding: 40px;">
                    <h2 style="color: #27ae60;">✓ Sucesso!</h2>
                    <p>Contrato assinado e será enviado ao seu e-mail.</p>
                </div>
            `;
        } else {
            alert("Erro ao enviar. Verifique sua chave.");
        }
    } catch (error) {
        alert("Erro de conexão.");
    } finally {
        btnEnviar.innerText = "Enviar Assinatura";
        btnEnviar.disabled = false;

        document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            // Insere o código da imagem no campo oculto que o Web3Forms enviará
            document.getElementById('assinaturaBase64').value = event.target.result;
            alert("Assinatura carregada com sucesso!");
        };
        reader.readAsDataURL(file);
    }
});
    }
});
