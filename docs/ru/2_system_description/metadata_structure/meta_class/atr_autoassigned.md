#### [Оглавление](/docs/ru/index.md)

### Предыдущая страница: [Индексация](/docs/ru/2_system_description/metadata_structure/meta_class/atr_indexed.md)

# Автозаполняемые атрибуты

## Описание
Тип **автозаполняемые поля** `"autoassigned": true` - указывает, что значение данного атрибута должно быть заполнено автоматически при создании экземпляра класса. Применяется в основном для атрибутов типа «Уникальный идентификатор» `"unique": true` для целосчисленных и строковых атрибутов, а также для атрибутов типа «Дата-время». 

## Принцип формирования:

1. Для атрибутов «Дата-время» атрибуту должно быть присвоено значение текущего момента времени. Используется для меток создания и изменения.
2. Для целочисленных атрибутов, если указано значение "Уникальный идентификатор" ("unique": true) при создании формы, заполняется случайным набором символов.
3. Для строк, если указано значение "Уникальный идентификатор" ("unique": true), то должно быть сгенерировано случайное значение hex - размером с длину строки - в примере ниже 20 символов.
```
var crypto = require('crypto');
ID = crypto.randomBytes(20).toString('hex');
```
4. Для типа "Глобальный идентификатор" - реализуется аналогично строке. 

NB. Необходимо сделать проверку при сохранении. Поле должно генерироваться автоматически для пустых значений или даты. Для всех остальных (целое, строка) должны генерироваться ранее созданные значения.

### Пример:
```
    {
      "orderNumber": 50,
      "name": "auto",
      "caption": "auto",
      "type": 6,
      "size": null,
      "decimals": 0,
      "nullable": true,
      "readonly": false,
      "indexed": false,
      "unique": true,
      "autoassigned": true
    }
```

### Следующая страница: [Значение по умолчанию](/docs/ru/2_system_description/metadata_structure/meta_class/atr_default_value.md)
--------------------------------------------------------------------------  


 #### [Licence](/LICENCE.md) &ensp;  [Contact us](https://iondv.com) &ensp;  [English](/docs/en/2_system_description/metadata_structure/meta_class/atr_autoassigned.md)    &ensp; [FAQs](/faqs.md)  <div><img src="https://mc.iondv.com/watch/local/docs/framework" style="position:absolute; left:-9999px;" height=1 width=1 alt="iondv metrics"></div>         



--------------------------------------------------------------------------  

Copyright (c) 2018 **LLC "ION DV"**.  
All rights reserved. 