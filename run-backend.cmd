@echo off
setlocal

rem Keep TLS verification enabled and use trusted Windows certificates.
set "JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStoreType=Windows-ROOT"

if "%FINE_TUNED_MODEL_ENDPOINT%"=="" (
  set "FINE_TUNED_MODEL_ENDPOINT=http://localhost:8001/api/generate"
)

if "%GEMINI_API_KEY%"=="" if "%OPENAI_API_KEY%"=="" (
  echo [ERROR] Set GEMINI_API_KEY before starting the backend.
  exit /b 1
)

cd /d "%~dp0backend"
call mvn.cmd spring-boot:run

