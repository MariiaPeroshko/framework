#### [Оглавление](/docs/ru/index.md)

### Предыдущая страница: [Конфигурационный файл deploy.json](/docs/ru/2_system_description/platform_configuration/deploy.md)

# Зависмости в package.json

Файл **package.json** - определяет структуру зависимостей и детальный состав модулей системы.

```
"ionMetaDependencies": { 
  "viewlib": "0.0.1" 
}
```

## Логика подключения при помощи скрипта

* если в названии объекта отсутствует слеш - / => "project-management"- подставляем в путь по умолчанию группу ION-APP - т.е. путь - //git.iondv.ru/ION-APP/project-management.
* если в названии есть слеш - значит задан уже с группой и просто склеиваем путь к гиту с группой и метой, пример "ION-METADATA/viewlib" - путь - //git.iondv.ru/ION-METADATA/viewlib.
* если значение версии начинается с git+http:// или git+https:// - то это полный путь к внешнему репозиторию - отбрасываем git+ и тянем гитом.
* если значение версии начинается с http:// или https:// - то это полный путь к архиву - тянем и распаковываем.  
**Не реализовано**, так как dapp не поддерживает работу с архивами.

### Пример файла `package.json`

```
{
  "name": "develop-and-test",
  "description": "Метапроект для тестирования и разработки",
  "version": "1.9.2",
  "homepage": "http://docker.local:8080",
  "bugs": {
    "url": "https://ion-dv.atlassian.net/projects/IONCORE/issues"
  },
  "repository": {
    "type": "git",
    "url": "https://git.iondv.ru/ION-METADATA/develop-and-test.git"
  },
  "engines": {
    "ion": "1.24.1"
  },
  "scripts": {
    "test": "mocha ./test/e2e/**/*.js"
  },
  "ionModulesDependencies": {
    "registry": "1.27.1",
    "geomap": "1.5.0",
    "portal": "1.3.0",
    "report": "1.9.2",
    "ionadmin": "1.4.0",
    "dashboard": "1.1.0",
    "rest": "1.1.2",
    "gantt-chart": "0.8.0"
  },
  "ionMetaDependencies": {
    "viewlib": "0.9.1"
  },
  "dependencies": {
    "esia": "git+https://git.iondv.ru/node-modules/esia.git"
  },
}


```
## Описание полей

| Поле            | Наименование | Описание                                                                                                                                                                                                                                                                                 |
|:----------------|:----------------------|:--------------------------------|
| `"name"`       | **Имя**      | Имя проекта.  |
| `"description"`| **Описание** | Описание проекта. |
| `"version"`    | **Версия**   | Номер текущей версии. |
| `"homepage"`   | **Домашняя страница** | Ссылка на собранный проект на докере. |
|    `"bugs"`     |   **Ошибки**           | Указывается ссылка на проект приложения в GitLab, где принимаются заявки об ошибках.|
| `"repository"` | **Репозиторий**  | Состоит из полей "type" и "url". Указыается тип репозитория и ссылка на него.                                                                                                                                                                                                                   |
| `"engines"`    | **Ядро**     | Номер версии ядра.  |
| `"scripts"`    | **Скрипты**  | Скрипт для сборки меты из разных групп и разных url.
| `"ionModulesDependencies"`        | **Зависимости модулей ion**               | Задает модули и их версии, используемые  в приложении. Проект включает в себя следующий состав модулей: •  "**ionadmin**" – модуль администрирования •  "**registry**" – модуль регистра •  "**report**" – модуль отчетов •  "**rest**": "- модуль rest-сервисов •  "**dashboard**" – модуль дашбоардов •  "**geomap**" - геомодуль •  "**gantt-chart**" – модуль диаграмм ганта •  "**portal**" – модуль портала                                                                                                                                    |
| `"ionMetaDependencies"`       | **Зависимости метаданных ion**        | Дополнительные приложения для функционирования системы.                                                                                                                                                                                                       |                                                                                                                                                                                                                                                                                                                                                                                              
| `"dependencies"`   | **Зависимости**      |  Прочие зависимости проекта.


### Следующая страница: [Конфигурация парaметров - ini-файлы](/docs/ru/2_system_description/platform_configuration/ini_files.md)

--------------------------------------------------------------------------  


 #### [Licence](/LICENCE.md) &ensp;  [Contact us](https://iondv.com) &ensp;  [English](/docs/en/2_system_description/platform_configuration/package.md)   &ensp; [FAQs](/faqs.md)  <div><img src="https://mc.iondv.com/watch/local/docs/framework" style="position:absolute; left:-9999px;" height=1 width=1 alt="iondv metrics"></div>
 
 --------------------------------------------------------------------------  

Copyright (c) 2018 **LLC "ION DV"**.  
All rights reserved. 