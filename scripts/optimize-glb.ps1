# Script de Otimizacao de Modelos GLB
# Supernatural AR - Pedra Branca Games

$publicDir = Join-Path $PSScriptRoot "..\public"
$backupDir = Join-Path $publicDir "backup-originals"

Write-Host ""
Write-Host "SUPERNATURAL AR - Otimizador de Modelos GLB" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

# Criar diretorio de backup
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Diretorio de backup criado: backup-originals/" -ForegroundColor Magenta
}

# Encontrar todos os arquivos GLB
$glbFiles = Get-ChildItem -Path $publicDir -Filter "*.glb" -File

if ($glbFiles.Count -eq 0) {
    Write-Host "Nenhum arquivo GLB encontrado!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Encontrados $($glbFiles.Count) arquivos GLB para otimizar" -ForegroundColor Yellow
Write-Host ""

$totalOriginal = 0
$totalOptimized = 0
$successCount = 0

foreach ($file in $glbFiles) {
    $fileName = $file.Name
    $filePath = $file.FullName
    $backupPath = Join-Path $backupDir $fileName
    $tempPath = $filePath -replace "\.glb$", "_optimized.glb"
    
    $originalSize = $file.Length
    $totalOriginal += $originalSize
    $originalSizeMB = [math]::Round($originalSize / 1MB, 2)
    
    Write-Host "Processando: $fileName" -ForegroundColor Cyan
    Write-Host "   Original: $originalSizeMB MB" -ForegroundColor Yellow
    
    # Fazer backup se nao existir
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $filePath -Destination $backupPath
        Write-Host "   Backup criado" -ForegroundColor Green
    }
    
    Write-Host "   Aplicando otimizacoes..." -ForegroundColor Yellow
    
    try {
        # Executar gltf-transform
        & npx gltf-transform optimize $filePath $tempPath --compress draco --texture-compress webp --texture-resize 1024 2>&1 | Out-Null
        
        if (Test-Path $tempPath) {
            $optimizedSize = (Get-Item $tempPath).Length
            $totalOptimized += $optimizedSize
            $optimizedSizeMB = [math]::Round($optimizedSize / 1MB, 2)
            $reduction = [math]::Round((1 - $optimizedSize / $originalSize) * 100, 1)
            
            # Substituir original pelo otimizado
            Remove-Item -Path $filePath -Force
            Rename-Item -Path $tempPath -NewName $fileName
            
            Write-Host "   Otimizado: $optimizedSizeMB MB (reducao: $reduction por cento)" -ForegroundColor Green
            
            $successCount++
        }
        else {
            throw "Arquivo otimizado nao foi criado"
        }
    }
    catch {
        Write-Host "   Erro: $_" -ForegroundColor Red
        $totalOptimized += $originalSize
        
        if (Test-Path $tempPath) {
            Remove-Item -Path $tempPath -Force
        }
    }
    
    Write-Host ""
}

# Relatorio final
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "RELATORIO FINAL" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host ""

$totalOriginalMB = [math]::Round($totalOriginal / 1MB, 2)
$totalOptimizedMB = [math]::Round($totalOptimized / 1MB, 2)
$totalReduction = [math]::Round((1 - $totalOptimized / $totalOriginal) * 100, 1)
$savedMB = [math]::Round(($totalOriginal - $totalOptimized) / 1MB, 2)

Write-Host "Arquivos processados: $successCount de $($glbFiles.Count)" -ForegroundColor Yellow
Write-Host "Tamanho original total: $totalOriginalMB MB" -ForegroundColor Yellow
Write-Host "Tamanho otimizado total: $totalOptimizedMB MB" -ForegroundColor Green
Write-Host "Reducao total: $savedMB MB ($totalReduction por cento)" -ForegroundColor Green
Write-Host ""
Write-Host "Otimizacao concluida!" -ForegroundColor Green
Write-Host "Arquivos originais salvos em: public/backup-originals/" -ForegroundColor Magenta
Write-Host ""
