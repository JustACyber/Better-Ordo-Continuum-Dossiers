#!/bin/bash

# Переходим в папку с кодом
cd Helper

# Запускаем бота (dotnet должен быть установлен через nixpacks.toml)
echo "Starting Bot..."
dotnet run --configuration Release
