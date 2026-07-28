const API_URL = '/api';

const form = document.getElementById('checker-form');
const gpuInput = document.getElementById('gpu');
const gpuDropdown = document.getElementById('gpu-dropdown');
const ramInput = document.getElementById('ram');
const resultCard = document.getElementById('result');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');

let allGpus = [];
// teste
async function loadGpuOptions() {
    try {
        const response = await fetch(`${API_URL}/gpus`);
        allGpus = await response.json();
    } catch (error) {
        console.error('Erro ao carregar lista de GPUs:', error);
    }
}

function renderDropdown(filterText = '') {
    gpuDropdown.innerHTML = '';
    
    const filtered = allGpus.filter(gpu => 
        gpu.modelo.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0 || filterText.trim() === '') {
        gpuDropdown.classList.add('hidden');
        return;
    }

    filtered.forEach(gpu => {
        const item = document.createElement('div');
        item.classList.add('dropdown-item');
        item.textContent = gpu.modelo;
        
        item.addEventListener('click', () => {
            gpuInput.value = gpu.modelo;
            gpuDropdown.classList.add('hidden');
        });

        gpuDropdown.appendChild(item);
    });

    gpuDropdown.classList.remove('hidden');
}

gpuInput.addEventListener('input', (e) => {
    renderDropdown(e.target.value);
});

gpuInput.addEventListener('focus', (e) => {
    if (e.target.value.trim() !== '') {
        renderDropdown(e.target.value);
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
        gpuDropdown.classList.add('hidden');
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const gpuModelo = gpuInput.value;
    const ram = ramInput.value;

    try {
        const response = await fetch(`${API_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gpuModelo, ram })
        });

        const data = await response.json();

        resultCard.classList.remove('hidden', 'success', 'error');

        if (data.compativel) {
            resultCard.classList.add('success');
            resultTitle.textContent = 'Compatível!';
        } else {
            resultCard.classList.add('error');
            resultTitle.textContent = 'Incompatível!';
        }

        resultMessage.textContent = data.motivo;

    } catch (error) {
        resultCard.classList.remove('hidden', 'success');
        resultCard.classList.add('error');
        resultTitle.textContent = 'Erro de Conexão';
        resultMessage.textContent = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    }
});

loadGpuOptions();