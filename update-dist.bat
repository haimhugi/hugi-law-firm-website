@echo off
setlocal
cd /d "%~dp0"

echo Building a fresh dist...
call npm run build
if errorlevel 1 (
  echo.
  echo Build failed. dist was not updated.
  pause
  exit /b 1
)

echo.
echo Publishing dist to Cloudflare...
call npx wrangler deploy
if errorlevel 1 (
  echo.
  echo Deploy failed. dist is updated locally, but Cloudflare was not changed.
  echo If you are not logged in, run: npx wrangler login
  echo Then run this file again.
  pause
  exit /b 1
)

echo.
echo Done. The new dist is published.
pause
endlocal
