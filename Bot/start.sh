[phases.setup]
nixPkgs = ["dotnet-sdk_8"]

[phases.build]
# Компилируем проект в папку "out" в корне
cmds = ["dotnet publish Helper/Helper.csproj -c Release -o out"]

[start]
# Запускаем скрипт
cmd = "bash start.sh"
