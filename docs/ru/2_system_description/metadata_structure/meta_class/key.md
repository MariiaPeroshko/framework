#### [Оглавление](/docs/ru/index.md)

### Предыдущая страница: [Структура](/docs/ru/2_system_description/metadata_structure/meta_class/isstruct.md)

# Ключевые поля
В каждом классе  обязательно должен быть задан ключевой атрибут  (поле `"key"` основной части меты класса). Без этого приложение не будет функционировать.

## Типы ключевых полей

1. Guid - "Глобальный идентификатор [12]". 
2. "Строка [0]". 
3. "Целое [6]". 

## Требования к ключевому атрибуту

При формировании меты ключевого атрибута,  поля `"unique"` и  `"autoassigned"`  выставляются в `true`. Необходимо запретить пустое значение, выставляя  `"nullable"` в `false`.

Если атрибут не генерируется автоматически, то `"autoassigned"` можно поставить в `false`, тогда поле должно быть задано оператором при создании. Например если это код  классификатора или регистрационный номер задаваемый внешним способом (на бумаге).  

### Следующая страница: [Семантический атрибут](/docs/ru/2_system_description/metadata_structure/meta_class/semantic.md)
--------------------------------------------------------------------------  


 #### [Licence](/LICENCE.md) &ensp;  [Contact us](https://iondv.ru/index.html) &ensp;  [English](/docs/en/2_system_description/metadata_structure/meta_class/key.md) &ensp; [FAQs](/faqs.md)  <div><img src="https://mc.iondv.com/watch/local/docs/framework" style="position:absolute; left:-9999px;" height=1 width=1 alt="iondv metrics"></div>         



--------------------------------------------------------------------------  

Copyright (c) 2018 **LLC "ION DV"**.  
All rights reserved.  