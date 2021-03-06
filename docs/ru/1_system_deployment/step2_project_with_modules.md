#### [Оглавление](/docs/ru/index.md)

### Предыдущая страница: [Установка окружения](docs/ru/1_system_deployment/step1_installing_environment.md)

# Шаг 2 Установка ядра, модулей и приложения

## Клонирование приложения и его компонентов

**NB:** пути не должны содержать русских букв и пробелов. Мы советуем размещать приложение в `c:\workspace`.

Рассматриваем формирование проекта с модулями на примере приложения `develop-and-test`.
1. Находим приложение в репозитории github. Набираем искомое приложение `develop-and-test` в поле поиска и переходим на него.

2. Переходим в репозиторий файлов на ветку версии.

3. Открываем файл `package.json` в котором смотрим зависимости.

```
  "engines": {
    "ion": "1.24.1"
  },
  "ionModulesDependencies": {
    "registry": "1.27.1",
    "geomap": "1.5.0",
    "graph": "1.3.2",
    "portal": "1.3.0",
    "report": "1.9.2",
    "ionadmin": "1.4.0",
    "dashboard": "1.1.0",
    "lk": "1.0.1",
    "soap": "1.1.2",
    "gantt-chart": "0.8.0"
  },
  "ionMetaDependencies": {
    "viewlib": "0.9.1"
    "viewlib-extra": "0.1.0"
```

1. `engines": "ion": 1.24.1` - версия ядра `1.24.1`.  

2. `ionModulesDependencies` - список модулей и их версий.  

3. `ionMetaDependencies` - список других метаданных, необходимых для проекта, в данном случае исключение `viewlib` - библиотека представлений.

**NB:** для переключения на tag номера версии - смотрите версии в файле `package.json`.

### Получение репозитория ядра

Ядро находится в репозитории [`framework`](https://github.com/iondv/framework). На главной странице есть поле с путем к репозиторию.

1. Запустите командную строку от имени администратора. 

2. Скопируйте адрес репозитория, перейдите в папку workspace командой  `cd c:\workspace` и выполните команду `git clone https://github.com/iondv/framework`. Эта команда создает папку `framework` и в неё клонирует репозиторий. 

### Получение модулей

1. Переходим в папку модулей командой `cd framework\modules`. 

2. Для каждого модуля из списка `package.json` в свойстве `ionModulesDependencies` - находим репозиторий модуля среди группы модулей ` https://github.com/iondv/ION-MODULES`.

3. Клонируйте все модули из списка `ionModulesDependencies` командой `git clone https://github.com/iondv/registry`.

4. Перейдите в папку установленного модуля, переключитесь на tag номера версии `git checkout tags/v1.27.1`. Например `1.27.1` - это номер версии модуля `registry`. 

5. Повторите для всех модулей. 

### Получение приложения

1. Переходим в папку приложения. Если вы находитесь в папке модулей выполните команду `cd ..\applications`.

2. Далее вернитесь на страницу репозитория `develop-and-test`, скопируйте путь и клонируйте его командой
`git clone https://github.com/iondv/develop-and-test`. 

3. Перейдите в папку установленного приложения, переключитесь на tag номера версии `git checkout tags/v1.17.0`.

4. Установка зависимостей в `ionMetaDependencies` осуществляется в папку `applications`, для установки необходимо убедиться, что находитесь в папке приложений. Клонируем приложения из списка в параметре  `ionMetaDependencies`. Для приложения `viewlib` клонируйте командой `git clone https://github.com/iondv/viewlib`.  

5. Перейдите в папку установленного приложения, переключитесь на tag номера версии `git checkout tags/v0.9.1`. Повторите для каждого приложения.

6. Приложение скомпоновано. 

**NB:** мы советуем создать для него проект в IDE, например Visual Studio Code и в нём создать конфигурациионный файл.  

## Конфигурациионный файл

Конфигурационный файл служит для задания основных параметров окружения приложения и настройки дополнительных параметров запуска.

1. Создайте конфигурационный файл `setup` с расширением `ini` в папке `config`.

2. Открываем файл в редакторе и вставляем содержимое. 

```
auth.denyTop=false 
auth.registration=false 
auth.exclude[]=/files/**
auth.exclude[]=/images/**
db.uri=mongodb://127.0.0.1:27017/db
db.user=username
db.pwd=password
server.ports[]=8888
server.ports[]=8889
server.ports[]=3000
module.default=registry
module.skip[]=offline-sync
fs.storageRoot=./files
fs.urlBase=/files

```
Самый главный параметр - `db.uri=mongodb://127.0.0.1:27017/db`. Он указывает на название базы которую мы будем использовать для приложения. База данных будет создана автоматически.

### Пример файла `setup.ini` с комментариями

```
auth.denyTop=false // - true если не нужна аутентификация на уровне платформы, и каждый модуль будет аутентифицироваться сам
auth.registration=false // если не требуется регистрация

// Исключения из проверки доступа безопасности
auth.exclude[]=/files/**
auth.exclude[]=/images/**

db.uri=mongodb://127.0.0.1:27017/db // URI подключения к БД
db.user=username // пользователь БД
db.pwd=password // пароль пользователя БД

// Запуск системы на этих портах
server.ports[]=8888
server.ports[]=8889
server.ports[]=3000

module.default=registry // модуль по умолчанию

module.skip[]=offline-sync // отключенные модули

// Настройки файлового хранилища
fs.storageRoot=./files // корневая директория хранилища, куда будут сохраняться файлы
fs.urlBase=/files // база для публикации файлов в http (база URL файлов)
```
Пример файла `setup.ini` перед использованием требует чтобы из него были удалены все комментарии начинающиеся со знаков `//`.

### Следующая страница: [Шаг 3 Сборка, развертывание и запуск](/docs/ru/1_system_deployment/step3_building_and_running.md)

--------------------------------------------------------------------------  


 #### [Licence](/LICENCE.md) &ensp;  [Contact us](https://iondv.ru/index.html) &ensp;  [English](/docs/en/1_system_deployment/step2_project_with_modules.md)   &ensp; [FAQs](/faqs.md)  <div><img src="https://mc.iondv.com/watch/local/docs/framework" style="position:absolute; left:-9999px;" height=1 width=1 alt="iondv metrics"></div>         



--------------------------------------------------------------------------  

Copyright (c) 2018 **LLC "ION DV"**.  
All rights reserved.  




