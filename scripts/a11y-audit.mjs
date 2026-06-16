/**
 * Auditoria de acessibilidade WCAG com axe-core.
 * Uso: node scripts/a11y-audit.mjs
 */
import { createServer } from 'http';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = 3847;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json'
};

function staticHandler(req, res) {
  let path = req.url.split('?')[0];
  if (path === '/') path = '/index.html';
  const filePath = join(ROOT, path.replace(/^\//, ''));
  if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}

function runAxe(url) {
  return new Promise((resolve, reject) => {
    const outFile = join(ROOT, 'a11y-report.json');
    const cmd = `npx --yes @axe-core/cli "${url}" --save a11y-report.json`;
    const child = spawn(cmd, [], { shell: true, stdio: 'pipe', windowsHide: true, cwd: ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('close', code => {
      resolve({ code, stdout, stderr, outFile });
    });
    child.on('error', reject);
  });
}

function buildMarkdown(report) {
  const violations = report.violations || [];
  const passes = report.passes || [];
  const incomplete = report.incomplete || [];
  let md = '# Relatório de Acessibilidade — WorldPanel\n\n';
  md += 'Gerado com **axe-core** (padrão WCAG 2.x / axe DevTools).\n\n';
  md += '| Métrica | Valor |\n|---------|-------|\n';
  md += '| Violações | ' + violations.length + ' |\n';
  md += '| Regras OK | ' + passes.length + ' |\n';
  md += '| Incompletas | ' + incomplete.length + ' |\n';
  md += '| URL | ' + (report.url || '—') + ' |\n';
  md += '| Data | ' + new Date().toISOString() + ' |\n\n';
  if (!violations.length) {
    md += '## Resultado\n\nNenhuma violação automática detectada na página inicial (overview).\n';
    return md;
  }
  md += '## Violações\n\n';
  violations.forEach((v, i) => {
    md += '### ' + (i + 1) + '. ' + v.id + ' — ' + v.help + '\n\n';
    md += '- **Impacto:** ' + v.impact + '\n';
    md += '- **Descrição:** ' + v.description + '\n';
    md += '- **WCAG:** ' + (v.tags || []).filter(t => t.startsWith('wcag')).join(', ') + '\n';
    md += '- **Ocorrências:** ' + v.nodes.length + '\n\n';
    v.nodes.slice(0, 5).forEach((n, j) => {
      md += (j + 1) + '. `' + (n.html || '').replace(/\n/g, ' ').slice(0, 120) + '`\n';
      md += '   - ' + (n.failureSummary || n.any?.[0]?.message || '') + '\n';
    });
    if (v.nodes.length > 5) md += '\n_… e mais ' + (v.nodes.length - 5) + ' elemento(s)_\n';
    md += '\n';
  });
  md += '## Recomendações gerais\n\n';
  md += '1. Corrigir violações **critical** e **serious** primeiro.\n';
  md += '2. Re-executar: `node scripts/a11y-audit.mjs`\n';
  md += '3. Validar manualmente navegação por teclado e leitores de tela.\n';
  return md;
}

const server = createServer(staticHandler);
server.listen(PORT, async () => {
  const url = 'http://127.0.0.1:' + PORT + '/index.html';
  console.log('Servindo', ROOT, 'em', url);
  try {
    const { stdout, stderr, outFile } = await runAxe(url);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (existsSync(outFile)) {
      const report = JSON.parse(readFileSync(outFile, 'utf8'));
      const items = Array.isArray(report) ? report[0] : report;
      const md = buildMarkdown(items);
      const mdPath = join(ROOT, 'a11y-report.md');
      writeFileSync(mdPath, md, 'utf8');
      console.log('\nRelatórios salvos:');
      console.log(' -', outFile);
      console.log(' -', mdPath);
      console.log('\nViolações:', (items.violations || []).length);
    } else {
      console.error('axe-core não gerou a11y-report.json');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    server.close();
  }
});
