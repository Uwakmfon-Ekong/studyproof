export interface CertificateData {
  documentName: string;
  date: string;
  certificateId: string;
  txHash: string;
}

export function downloadCertificate(cert: CertificateData): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 750);
  bgGrad.addColorStop(0, '#fefefe');
  bgGrad.addColorStop(0.5, '#fdf8ff');
  bgGrad.addColorStop(1, '#fef7ed');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 750);

  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 1140, 690);
  ctx.strokeStyle = '#c4b5fd';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 670);

  [[60, 60], [1140, 60], [60, 690], [1140, 690]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
  });

  const iconGrad = ctx.createLinearGradient(570, 80, 630, 140);
  iconGrad.addColorStop(0, '#8b5cf6');
  iconGrad.addColorStop(1, '#fbbf24');
  ctx.fillStyle = iconGrad;
  ctx.beginPath();
  ctx.roundRect(570, 80, 60, 60, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SP', 600, 120);

  ctx.fillStyle = '#6d28d9';
  ctx.font = '500 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('S T U D Y P R O O F', 600, 172);

  ctx.fillStyle = '#1f1f1f';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('Certificate of Study', 600, 228);

  ctx.fillStyle = '#6b7280';
  ctx.font = '15px sans-serif';
  ctx.fillText('verified on 0G storage layer', 600, 258);

  const sealGrad = ctx.createRadialGradient(600, 335, 0, 600, 335, 52);
  sealGrad.addColorStop(0, '#fde68a');
  sealGrad.addColorStop(1, '#f59e0b');
  ctx.beginPath();
  ctx.arc(600, 335, 52, 0, Math.PI * 2);
  ctx.fillStyle = sealGrad;
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 600, 348);

  const div1 = ctx.createLinearGradient(200, 408, 1000, 408);
  div1.addColorStop(0, 'transparent');
  div1.addColorStop(0.3, '#c4b5fd');
  div1.addColorStop(0.7, '#c4b5fd');
  div1.addColorStop(1, 'transparent');
  ctx.strokeStyle = div1;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 408);
  ctx.lineTo(1000, 408);
  ctx.stroke();

  ctx.fillStyle = '#6b7280';
  ctx.font = '500 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('D O C U M E N T  S T U D I E D', 600, 438);

  ctx.fillStyle = '#1f1f1f';
  ctx.font = 'bold 26px sans-serif';
  const displayName = cert.documentName.length > 52
    ? cert.documentName.slice(0, 49) + '...'
    : cert.documentName;
  ctx.fillText(displayName, 600, 474);

  ctx.fillStyle = '#6b7280';
  ctx.font = '11px sans-serif';
  ctx.fillText('D A T E  A N D  T I M E', 600, 512);
  ctx.fillStyle = '#374151';
  ctx.font = '500 16px sans-serif';
  ctx.fillText(cert.date, 600, 535);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, 558);
  ctx.lineTo(900, 558);
  ctx.stroke();

  ctx.fillStyle = '#6b7280';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('C E R T I F I C A T E  I D', 200, 585);
  ctx.textAlign = 'right';
  ctx.fillText('T X  H A S H  ( 0 G )', 1000, 585);

  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(cert.certificateId, 200, 608);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(cert.txHash.slice(0, 22) + '...' + cert.txHash.slice(-8), 1000, 608);

  ctx.fillStyle = '#d1d5db';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Powered by 0G Storage Layer · studyproof.app', 600, 688);

  const link = document.createElement('a');
  link.download = `StudyProof-${cert.certificateId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}