@echo off
setlocal
cd /d "%~dp0finetuning"

set "PYTHON_EXE=%~dp0evaluation\.openai-env\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

set "HF_HUB_OFFLINE=1"
set "TRANSFORMERS_OFFLINE=1"
"%PYTHON_EXE%" api_server.py

