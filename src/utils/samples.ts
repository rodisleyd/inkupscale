export interface ArtworkSample {
  id: string;
  title: string;
  category: 'Nanquim & Hachuras' | 'Mangá & Quadrinhos' | 'Arte Colorida';
  originalSize: string;
  description: string;
  dataUrl: string;
}

// Generate procedurally crafted line arts matching the styles from the PDF
function createSampleCanvas(type: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // White paper base with very subtle paper tone (simulating scanned paper with slight noise)
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, 768, 768);

  ctx.strokeStyle = '#18181b';
  ctx.fillStyle = '#18181b';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'batman_noir') {
    // Page 4 in PDF: Dark cowl, sharp angular jaw, intense crosshatching
    // Background crosshatching
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.moveTo(100 + i * 8, 40);
      ctx.lineTo(160 + i * 8, 380);
      ctx.stroke();
    }
    // Cowl outline & ears
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(380, 80); // right ear
    ctx.lineTo(390, 220);
    ctx.lineTo(470, 260);
    ctx.lineTo(440, 520); // neck
    ctx.lineTo(320, 620); // chin
    ctx.lineTo(260, 580);
    ctx.lineTo(240, 500); // jawline
    ctx.lineTo(210, 420); // cheek
    ctx.lineTo(190, 360); // nose tip
    ctx.lineTo(240, 320);
    ctx.lineTo(250, 180);
    ctx.lineTo(260, 60); // left ear
    ctx.lineTo(300, 220);
    ctx.lineTo(380, 80);
    ctx.stroke();

    // Heavy black fills (ink pools)
    ctx.beginPath();
    ctx.moveTo(260, 60);
    ctx.lineTo(300, 220);
    ctx.lineTo(380, 80);
    ctx.lineTo(390, 220);
    ctx.lineTo(340, 240);
    ctx.lineTo(270, 230);
    ctx.closePath();
    ctx.fill();

    // Crosshatching on cheek and cowl
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 45; k++) {
      ctx.beginPath();
      ctx.moveTo(220 + k * 4, 340 + k * 2);
      ctx.lineTo(250 + k * 4, 460 + k * 2);
      ctx.stroke();

      // Cross
      ctx.beginPath();
      ctx.moveTo(260 + k * 3, 350 - k * 1);
      ctx.lineTo(210 + k * 3, 440 - k * 1);
      ctx.stroke();
    }

    // Jaw hatching
    for (let j = 0; j < 30; j++) {
      ctx.beginPath();
      ctx.moveTo(240 + j * 3, 490 + j);
      ctx.lineTo(290 + j * 3, 560 + j);
      ctx.stroke();
    }
  } else if (type === 'manga_girl') {
    // Page 5 in PDF: Berserk / Inio Asano style fine line portrait with organic tree branches & hair
    // Trees in background
    ctx.lineWidth = 2.5;
    for (let t = 0; t < 6; t++) {
      const bx = 60 + t * 120;
      ctx.beginPath();
      ctx.moveTo(bx, 600);
      ctx.quadraticCurveTo(bx + (t % 2 === 0 ? 30 : -30), 300, bx + 10, 80);
      ctx.stroke();

      // Branch crosshatching
      ctx.lineWidth = 1;
      for (let b = 0; b < 20; b++) {
        ctx.beginPath();
        ctx.moveTo(bx - 15, 200 + b * 15);
        ctx.lineTo(bx + 15, 210 + b * 15);
        ctx.stroke();
      }
    }

    // Face outline
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(480, 280);
    ctx.quadraticCurveTo(520, 380, 480, 480); // cheek
    ctx.quadraticCurveTo(440, 560, 400, 570); // chin
    ctx.quadraticCurveTo(340, 500, 330, 400); // jaw
    ctx.stroke();

    // Eye details
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(430, 360, 18, 0, Math.PI, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(430, 360, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair strands (dense delicate lines)
    ctx.lineWidth = 1.2;
    for (let h = 0; h < 90; h++) {
      ctx.beginPath();
      const sx = 280 + h * 3;
      ctx.moveTo(sx, 160 + Math.sin(h * 0.1) * 20);
      ctx.bezierCurveTo(sx - 30, 320, sx + 20, 480, sx - 10, 680);
      ctx.stroke();
    }
  } else if (type === 'shonen_dynamic') {
    // Page 6 in PDF: Strong sharp perspective, thick manga shadows
    ctx.fillStyle = '#0f172a';
    // Deep black hair spikes
    ctx.beginPath();
    ctx.moveTo(180, 160);
    ctx.lineTo(240, 60);
    ctx.lineTo(310, 180);
    ctx.lineTo(380, 40);
    ctx.lineTo(460, 190);
    ctx.lineTo(540, 60);
    ctx.lineTo(590, 240);
    ctx.lineTo(520, 320);
    ctx.lineTo(200, 320);
    ctx.closePath();
    ctx.fill();

    // Intense brow and eyes
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(270, 320);
    ctx.lineTo(370, 350);
    ctx.lineTo(470, 320);
    ctx.stroke();

    // Neck shadow speedlines
    ctx.lineWidth = 2;
    for (let s = 0; s < 40; s++) {
      ctx.beginPath();
      ctx.moveTo(300 + s * 4, 480);
      ctx.lineTo(320 + s * 4, 620);
      ctx.stroke();
    }
  } else if (type === 'comic_page') {
    // Page 7 in PDF: Multi-panel comic strip with characters, speech balloons, and horse riding
    ctx.lineWidth = 3.5;
    // Panels
    ctx.strokeRect(50, 40, 310, 300);
    ctx.strokeRect(390, 40, 330, 300);
    ctx.strokeRect(50, 370, 670, 340);

    // Characters in bottom panel
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(380, 480, 35, 0, Math.PI * 2); // horseman
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(380, 515);
    ctx.lineTo(380, 640);
    ctx.stroke();

    // Speedlines / Landscape hatching
    for (let l = 0; l < 50; l++) {
      ctx.beginPath();
      ctx.moveTo(60 + l * 12, 620 + (l % 3) * 10);
      ctx.lineTo(80 + l * 12, 690);
      ctx.stroke();
    }
  } else {
    // Color illustration test
    // Vibrant sunset gradient + inked silhouette
    const grad = ctx.createLinearGradient(0, 0, 768, 768);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#6366f1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 768, 768);

    // Inked character silhouette
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(384, 300, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(250, 600);
    ctx.quadraticCurveTo(384, 390, 518, 600);
    ctx.closePath();
    ctx.fill();
  }

  // Add subtle synthetic scanner grain/noise to simulate real hand-drawn scanning
  const imgData = ctx.getImageData(0, 0, 768, 768);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
}

export function getArtworkSamples(): ArtworkSample[] {
  // Only evaluate when window exists
  if (typeof window === 'undefined') return [];

  return [
    {
      id: 'batman_noir',
      title: 'Batman Noir (Nanquim & Hachuras)',
      category: 'Nanquim & Hachuras',
      originalSize: '768 × 768 px',
      description: 'Hachuras densas, serrilhado de caneta bico de pena e manchas de nanquim puro.',
      dataUrl: createSampleCanvas('batman_noir')
    },
    {
      id: 'manga_girl',
      title: 'Mangá Seinen (Folhagem & Cabelo)',
      category: 'Mangá & Quadrinhos',
      originalSize: '768 × 768 px',
      description: 'Fios ultrafinos de cabelo, texturas de árvores e micro-detalhes de arte final.',
      dataUrl: createSampleCanvas('manga_girl')
    },
    {
      id: 'shonen_dynamic',
      title: 'Shōnen Action (Traço Dinâmico)',
      category: 'Mangá & Quadrinhos',
      originalSize: '768 × 768 px',
      description: 'Pretos chapados, linhas de velocidade e contraste extremo sem borramento.',
      dataUrl: createSampleCanvas('shonen_dynamic')
    },
    {
      id: 'comic_page',
      title: 'Prancha de Quadrinhos (Western)',
      category: 'Mangá & Quadrinhos',
      originalSize: '768 × 768 px',
      description: 'Estrutura multi-painel com balões, cenários e hachuras clássicas de quadrinhos.',
      dataUrl: createSampleCanvas('comic_page')
    },
    {
      id: 'color_sunset',
      title: 'Arte Digital Colorida (Gradientes)',
      category: 'Arte Colorida',
      originalSize: '768 × 768 px',
      description: 'Gradientes cromáticos para testar o modo Super Resolution 4×/8×.',
      dataUrl: createSampleCanvas('color_sunset')
    }
  ];
}
