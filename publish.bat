@echo off
setlocal enabledelayedexpansion

pushd "%~dp0."

echo ============================================================================
echo   truncgil-uxigl - NPM Publish Araci
echo ============================================================================

for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set "CURRENT_VER=%%v"
echo Mevcut surum: v%CURRENT_VER%
echo.

if /i "%~1"=="--check" (
    echo [OK] publish.bat sozdizimi ve surum okuma testi basarili: v%CURRENT_VER%
    popd
    exit /b 0
)

REM 1. NPM oturum kontrolu
echo [1/5] NPM oturumu kontrol ediliyor...
call npm whoami >nul 2>&1
if not errorlevel 1 goto npm_logged_in

echo [!] NPM oturumu acik degil. Lutfen giris yapin:
call npm login
if errorlevel 1 (
    echo [HATA] NPM girisi basarisiz oldu.
    popd
    pause
    exit /b 1
)

:npm_logged_in
for /f "delims=" %%u in ('call npm whoami') do set "NPM_USER=%%u"
echo [OK] NPM kullanicisi: %NPM_USER%
echo.

REM 2. Surum secimi (arguman varsa dogrudan kullan, yoksa sor)
set "BUMP_TYPE=%~1"
if not "%BUMP_TYPE%"=="" goto apply_version

echo Surum artis tipini secin:
echo   [1] patch  - Hata duzeltmesi [Varsayilan]
echo   [2] minor  - Yeni ozellik [orn: 2.6.0]
echo   [3] major  - Koklu degisiklik
echo   [4] Ozel surum numarasi gir [orn: 2.6.0]
echo   [5] Mevcut surumu degistirmeden yayinla [v%CURRENT_VER%]
echo.
set "CHOICE="
set /p "CHOICE=Seciminiz [1-5, Enter=1]: "

if "%CHOICE%"=="" set "CHOICE=1"
if "%CHOICE%"=="1" set "BUMP_TYPE=patch"
if "%CHOICE%"=="2" set "BUMP_TYPE=minor"
if "%CHOICE%"=="3" set "BUMP_TYPE=major"
if "%CHOICE%"=="4" set /p "BUMP_TYPE=Yeni surum numarasini girin [orn: 2.6.0]: "
if "%CHOICE%"=="5" set "BUMP_TYPE=none"

:apply_version
echo.
if /i "%BUMP_TYPE%"=="none" goto keep_version

echo [2/5] Surum guncelleniyor: %BUMP_TYPE% ...
call npm version %BUMP_TYPE% --no-git-tag-version
if errorlevel 1 (
    echo [HATA] Surum numarasi guncellenemedi.
    popd
    pause
    exit /b 1
)
goto version_ready

:keep_version
echo [2/5] Mevcut surum korunuyor: v%CURRENT_VER% ...

:version_ready
for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set "NEW_VER=%%v"
echo [OK] Yayinlanacak surum: v%NEW_VER%
echo.

REM 3. Uretim derlemesi (Demo + Lib)
echo [3/5] Demo ve kutuphane paketleri derleniyor: npm run build ...
call npm run build
if errorlevel 1 (
    echo [HATA] Derleme sirasinda hata olustu! Yayinlama iptal edildi.
    popd
    pause
    exit /b 1
)
echo [OK] Derleme basariyla tamamlandi.
echo.

REM 4. NPM Publish
echo [4/5] Paket NPM uzerinde yayinlaniyor: truncgil-uxigl@%NEW_VER% ...
call npm publish --access public
if errorlevel 1 (
    echo [HATA] npm publish basarisiz oldu!
    popd
    pause
    exit /b 1
)
echo [OK] truncgil-uxigl@%NEW_VER% basariyla NPM'de yayinlandi!
echo.

REM 5. Git Commit, Tag ve Push
echo [5/5] Git commit, etiket [v%NEW_VER%] ve push islemi yapiliyor...
git add package.json
if exist package-lock.json git add package-lock.json
git diff --cached --quiet
if errorlevel 1 git commit -m "chore: release v%NEW_VER%"
git tag -f "v%NEW_VER%"
git push origin main --tags

echo.
echo ============================================================================
echo   TAMAMLANDI: truncgil-uxigl@%NEW_VER% yayinlandi ve Git'e aktarildi
echo   NPM   : https://www.npmjs.com/package/truncgil-uxigl
echo   GitHub: https://github.com/umitunc/uxigl
echo ============================================================================
popd
pause
endlocal
