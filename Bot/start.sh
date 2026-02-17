#!/bin/bash

echo "--- DEBUG: Checking directories ---"
ls -la
echo "--- DEBUG: Checking out/ directory ---"
ls -la Helper/ || echo "Directory 'out' does not exist!"

# Если файла нет, скрипт упадет, но мы увидим логи выше
if [ -f "Helper" ]; then
    echo "--- Found Binary, granting permissions... ---"
    chmod +x Helper
    echo "--- Launching Bot... ---"
    exec ./Helper
else
    echo "ERROR: Binary 'Helper' was not found. Build likely failed."
    exit 1
fi
