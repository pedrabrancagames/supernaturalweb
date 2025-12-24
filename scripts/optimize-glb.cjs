#!/usr/bin/env node
/**
 * Script de Otimização de Modelos GLB
 * Supernatural AR - Pedra Branca Games
 * 
 * Aplica as seguintes otimizações:
 * 1. Compressão de geometria com Draco
 * 2. Redução de texturas para WebP
 * 3. Remoção de recursos duplicados e não utilizados
 * 4. Otimização geral para mobile
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Diretório com os arquivos GLB
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BACKUP_DIR = path.join(__dirname, '..', 'public', 'backup-originals');

// Cores para console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeGLB() {
    log('\n🎮 SUPERNATURAL AR - Otimizador de Modelos GLB', 'cyan');
    log('═'.repeat(50), 'cyan');

    // Encontrar todos os arquivos GLB
    const glbFiles = fs.readdirSync(PUBLIC_DIR)
        .filter(file => file.endsWith('.glb'))
        .map(file => path.join(PUBLIC_DIR, file));

    if (glbFiles.length === 0) {
        log('❌ Nenhum arquivo GLB encontrado!', 'red');
        return;
    }

    log(`\n📁 Encontrados ${glbFiles.length} arquivos GLB para otimizar\n`, 'yellow');

    // Criar diretório de backup
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        log('📦 Diretório de backup criado: backup-originals/', 'magenta');
    }

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    const results = [];

    for (const glbPath of glbFiles) {
        const fileName = path.basename(glbPath);
        const backupPath = path.join(BACKUP_DIR, fileName);
        const tempPath = glbPath.replace('.glb', '_optimized.glb');

        try {
            // Tamanho original
            const originalSize = fs.statSync(glbPath).size;
            totalOriginalSize += originalSize;

            log(`\n🔧 Processando: ${fileName}`, 'cyan');
            log(`   Original: ${formatBytes(originalSize)}`, 'yellow');

            // Fazer backup se ainda não existir
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(glbPath, backupPath);
                log(`   ✓ Backup criado`, 'green');
            }

            // Comando de otimização com gltf-transform
            // Aplicando: dedup, prune, draco, webp, resize (max 1024px)
            const command = [
                'npx gltf-transform optimize',
                `"${glbPath}"`,
                `"${tempPath}"`,
                '--compress draco',           // Compressão de geometria Draco
                '--texture-compress webp',    // Converte texturas para WebP
                '--texture-resize 1024',      // Redimensiona texturas para max 1024px
            ].join(' ');

            log(`   ⏳ Aplicando otimizações...`, 'yellow');
            execSync(command, { stdio: 'pipe' });

            // Verificar se o arquivo otimizado foi criado
            if (fs.existsSync(tempPath)) {
                const optimizedSize = fs.statSync(tempPath).size;
                totalOptimizedSize += optimizedSize;

                // Substituir o original pelo otimizado
                fs.unlinkSync(glbPath);
                fs.renameSync(tempPath, glbPath);

                const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
                log(`   ✓ Otimizado: ${formatBytes(optimizedSize)} (-${reduction}%)`, 'green');

                results.push({
                    file: fileName,
                    original: originalSize,
                    optimized: optimizedSize,
                    reduction: parseFloat(reduction)
                });
            } else {
                throw new Error('Arquivo otimizado não foi criado');
            }

        } catch (error) {
            log(`   ❌ Erro: ${error.message}`, 'red');
            totalOptimizedSize += fs.statSync(glbPath).size;

            // Limpar arquivo temporário se existir
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }

            results.push({
                file: fileName,
                error: error.message
            });
        }
    }

    // Relatório final
    log('\n' + '═'.repeat(50), 'cyan');
    log('📊 RELATÓRIO FINAL', 'cyan');
    log('═'.repeat(50), 'cyan');

    log(`\n📁 Arquivos processados: ${results.filter(r => !r.error).length}/${glbFiles.length}`, 'yellow');
    log(`📦 Tamanho original total: ${formatBytes(totalOriginalSize)}`, 'yellow');
    log(`📦 Tamanho otimizado total: ${formatBytes(totalOptimizedSize)}`, 'green');

    const totalReduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
    log(`🚀 Redução total: ${formatBytes(totalOriginalSize - totalOptimizedSize)} (-${totalReduction}%)`, 'green');

    // Top reduções
    const successResults = results.filter(r => !r.error).sort((a, b) => b.reduction - a.reduction);
    if (successResults.length > 0) {
        log('\n🏆 Maiores reduções:', 'magenta');
        successResults.slice(0, 5).forEach((r, i) => {
            log(`   ${i + 1}. ${r.file}: -${r.reduction}%`, 'green');
        });
    }

    // Erros
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
        log('\n⚠️  Arquivos com erro:', 'red');
        errors.forEach(r => {
            log(`   - ${r.file}: ${r.error}`, 'red');
        });
    }

    log('\n✅ Otimização concluída!', 'green');
    log('💾 Arquivos originais salvos em: public/backup-originals/', 'magenta');
    log('\n');
}

// Executar
optimizeGLB().catch(console.error);
