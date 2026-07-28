const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend (index.html, style.css, app.js, assets)
app.use(express.static(path.join(__dirname, '../frontend')));

const gpusPath = path.join(__dirname, 'data', 'gpus.json');

function loadGpus() {
  if (fs.existsSync(gpusPath)) {
    const rawData = fs.readFileSync(gpusPath, 'utf-8');
    return JSON.parse(rawData);
  }
  return [];
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API TabDoc Vulkan online!' });
});

app.get('/api/gpus', (req, res) => {
  const gpus = loadGpus();
  const list = gpus.map(gpu => ({
    fabricante: gpu.fabricante,
    modelo: gpu.modelo
  }));
  res.json(list);
});

app.post('/api/check', (req, res) => {
  const { gpuModelo, ram } = req.body;
  const gpus = loadGpus();
  
  const foundGpu = gpus.find(
    g => g.modelo.toLowerCase() === (gpuModelo || '').toLowerCase()
  );

  if (!foundGpu) {
    return res.status(404).json({
      compativel: false,
      motivo: 'Placa de vídeo não encontrada no banco de dados.'
    });
  }

  const ramNum = Number(ram);
  if (isNaN(ramNum) || ramNum < 8) {
    return res.json({
      compativel: false,
      motivo: 'Quantidade de memória RAM insuficiente. O Minecraft exige pelo menos 8 GB para rodar com estabilidade.'
    });
  }

  if (!foundGpu.compativel) {
    return res.json({
      compativel: false,
      motivo: `A placa ${foundGpu.modelo} não possui suporte nativo ao Vulkan 1.3.`
    });
  }

  res.json({
    compativel: true,
    motivo: `Seu sistema com ${foundGpu.modelo} e ${ramNum} GB de RAM atende aos requisitos do Vulkan 1.3!`
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});