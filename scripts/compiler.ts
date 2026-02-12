import * as fs from 'fs';
import * as path from 'path';
interface SecurityHeader {
  key: string;
  value: string;
}

const dslPath = path.join(process.cwd(), 'rules.shield');
const outputPath = path.join(process.cwd(), 'security-headers.json');

console.log("🛡️  [FrameShield] Pornire compilare DSL...");

try {
  if (!fs.existsSync(dslPath)) {
     console.warn("⚠️  Nu am găsit rules.shield. Creez unul default (BLOCK_ALL).");
     fs.writeFileSync(dslPath, "FRAME_STRATEGY: BLOCK_ALL");
  }

  const dslContent = fs.readFileSync(dslPath, 'utf-8');
  const headers: SecurityHeader[] = [];

  if (dslContent.includes('FRAME_STRATEGY: BLOCK_ALL')) {
    console.log("🔒  Regula detectată: BLOCK_ALL (Nimeni nu te poate clona)");
    
    headers.push({ key: 'X-Frame-Options', value: 'DENY' });
    headers.push({ key: 'Content-Security-Policy', value: "frame-ancestors 'none';" });
  } 
  else if (dslContent.includes('FRAME_STRATEGY: ALLOW_PARTNER')) {
    console.log("🔓  Regula detectată: ALLOW_PARTNER");
  }

  fs.writeFileSync(outputPath, JSON.stringify(headers, null, 2));
  console.log("✅  [FrameShield] Configurația de securitate actualizată cu succes!");

} catch (error) {
  console.error("❌  [FrameShield] Eroare critică:", error);
  fs.writeFileSync(outputPath, "[]");
}