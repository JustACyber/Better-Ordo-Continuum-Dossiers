#!/bin/bash

echo "--- STARTING BOT RUNNER ---"
echo "Current Directory: $(pwd)"

# Проверяем, существует ли папка out и бинарник в ней (результат шага phases.build)
if [ -f "out/Bot" ]; then
    echo "--- Binary found in 'out/Bot'. Launching... ---"
    chmod +x out/Bot
    exec ./out/Bot
else
    # Если бинарника нет, значит фаза сборки прошла некорректно или сохранила не туда.
    # Выводим список всех файлов для диагностики.
    echo "CRITICAL ERROR: 'out/Bot' not found."
    echo "Listing all files to debug paths:"
    find . -maxdepth 3 -not -path '*/.*'
    exit 1
fi
