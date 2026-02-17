#!/bin/bash

# Даем права на выполнение бинарнику
chmod +x out/Helper

# Запускаем бинарник напрямую (dotnet команда не нужна, так как он self-contained)
exec ./out/Helper
