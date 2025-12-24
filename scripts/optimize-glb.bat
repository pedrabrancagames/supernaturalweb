@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================
echo SUPERNATURAL AR - Otimizador de Modelos GLB
echo ================================================
echo.

cd /d "%~dp0..\public"

if not exist "backup-originals" mkdir backup-originals

echo Processando arquivos GLB...
echo.

for %%f in (*.glb) do (
    if not "%%f"=="%%~nf_opt.glb" (
        echo Processando: %%f
        
        REM Backup se nao existir
        if not exist "backup-originals\%%f" (
            copy "%%f" "backup-originals\%%f" > nul
            echo    Backup criado
        )
        
        echo    Otimizando...
        call npx gltf-transform optimize "%%f" "%%~nf_opt.glb" --compress draco --texture-compress webp
        
        if exist "%%~nf_opt.glb" (
            del "%%f"
            ren "%%~nf_opt.glb" "%%f"
            echo    Concluido!
        ) else (
            echo    Erro ao otimizar
        )
        echo.
    )
)

echo ================================================
echo Otimizacao concluida!
echo Backups em: public\backup-originals\
echo ================================================
