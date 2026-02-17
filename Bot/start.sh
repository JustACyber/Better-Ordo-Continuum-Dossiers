#!/bin/bash

echo "--- PREPARING BOT ---"

# 1. Диагностика: проверяем версию dotnet
if ! command -v dotnet &> /dev/null; then
    echo "WARNING: 'dotnet' command not found. The environment might be missing the SDK."
else
    echo "DOTNET SDK detected: $(dotnet --version)"
fi

# 2. Если бинарника нет, запускаем "Аварийную сборку" прямо перед стартом
if [ ! -f "published/Bot" ]; then
    echo "--- Binary missing. Starting Just-In-Time Build... ---"
    
    # Создаем папку для вывода
    mkdir -p published
    
    # Запускаем компиляцию кода из папки Helper
    echo "Building Helper/Helper.csproj..."
    dotnet publish Helper/Helper.csproj -c Release -r linux-x64 --self-contained true /p:AssemblyName=Bot -o published
    
    BUILD_STATUS=$?
    if [ $BUILD_STATUS -ne 0 ]; then
        echo "CRITICAL ERROR: Build failed with exit code $BUILD_STATUS"
        exit 1
    fi
    echo "--- Build successful! ---"
else
    echo "--- Binary found. Skipping build. ---"
fi

# 3. Запуск
if [ -f "published/Bot" ]; then
    echo "--- Launching Bot... ---"
    chmod +x published/Bot
    exec ./published/Bot
else
    echo "ERROR: 'published/Bot' still missing after build attempt."
    # Вывод списка файлов для отладки
    ls -R
    exit 1
fi
