#### [Оглавление](/docs/ru/index.md)

### Предыдущая страница: [Признак абстрактности для класса](/docs/ru/2_system_description/metadata_structure/meta_class/abstract.md)

# Версионирование
 
 
 **Версионирование** - позволяет хранить в системе сразу несколько версий метаданных. В каждый объект при изменении и сохранении проставляется его версия. Таким образом, версионирование предоставляет возможность работы с различными версиями одних объектов.  
 
 Версионирование задается в поле `"version"` основной части меты классов. Чтобы изменить версию меты, необходимо добавить атрибут  `version`("version" : 2).
 
## Механизм работы
 При загрузке метаданных если есть атрибут  version ("version" : 2), то будет закачена мета с версией, иначе версия = 1 
 ```
 {
   "isStruct": false,
   "key": "id",
   "semantic": "caption",
   "name": "ion_filter",
   "caption": "Фильтры",
   "ancestor": null,
   "container": null,
   "creationTracker": "",
   "changeTracker": "",
   "version" : 2
  
 }
 
 ```
 
 При создании объектов к ним будет добавляться последняя версия метаданных из текущих в базе, а при редактировании объектов они будут редактироваться на основании сохраненной версии. 
 
 Пример сохраненных объектов с разными версиями в базе:
 ```
 {
     "_id" : ObjectId("567cfa1eb869fc2833690ea4"),
     "id" : 24006,
     "class" : "ALL",
     "caption" : "11",
     "html" : "",
     "filter" : "[\"{\\\"property\\\":\\\"contact\\\",\\\"operation\\\":20,\\\"value\\\":\\\"11\\\",\\\"title\\\":\\\"Контактная информация содержит 11\\\",\\\"type\\\":7}\"]",
     "period" : "2015-12-08,2016-02-05",
     "version" : 1,
     "semanticTitle" : "11 "
 }
 
 {
     "_id" : ObjectId("56944e5cb73f51ec182c7369"),
     "class" : "ALL",
     "caption" : "fffffff",
     "filter" : "[\"{\\\"property\\\":\\\"class\\\",\\\"operation\\\":0,\\\"value\\\":\\\"fff\\\",\\\"title\\\":\\\"Класс фильтра равно fff\\\",\\\"type\\\":1}\"]",
     "version" : 2,
     "id" : NaN,
     "semanticTitle" : "fffffff "
 }
 ```
 
 
## Работа в коде
 
При считывании меты классов, данные разделяются по версиям.  Имена версионированных классов имеют имена следующего вида “<имя_класса>_<номер версии>”. Например ion_filter_1, ion_filter_2 – Класс ion_filter версии 1 и 2 соответственно.  

При выборке объектов, данные берутся с учётом версии. Версия объекта передаётся в виде параметра `version` запроса на открытие объекта.


### Следующая страница: [Родительский класс](/docs/ru/2_system_description/metadata_structure/meta_class/ancestor.md)
--------------------------------------------------------------------------  


 #### [Licence](/LICENCE.md) &ensp;  [Contact us](https://iondv.com) &ensp;  [English](/docs/en/2_system_description/metadata_structure/meta_class/metaversion.md)   &ensp; [FAQs](/faqs.md)  <div><img src="https://mc.iondv.com/watch/local/docs/framework" style="position:absolute; left:-9999px;" height=1 width=1 alt="iondv metrics"></div>         



--------------------------------------------------------------------------  

Copyright (c) 2018 **LLC "ION DV"**.
All rights reserved. 