/**
 * Created by akumidv on 21.09.2016.
 * Конвертор версий метаданных
 */

// Уточняем параметры jsHint.
// maxcomplexity - цикломатическая сложность функций разбора по типам 25 (вложенные свитчи и кейсы), а не 10ть из-за архитектуры и упрощения чтения
// jshint maxcomplexity: 25, maxstatements: 25

// TODO перед конвертацией связи, СУПа прогнать генерацию представлений из утилиты Сергея Клепикова???

'use strict';

var util = require('util');

const metaVersion = require('lib/meta-update/meta-version');
var transfMD = require('lib/meta-update/transformation');

var fs = require('fs');
var path = require('path');
var assert = require('assert');

let searchMinVersion = require('lib/meta-update/meta-utils').searchMinVersion;
let compareSemVer = require('lib/meta-update/meta-utils').compareSemVer;

const pathToApp = path.join(__dirname, '..', 'applications'); // При запуске из bin

console.log('Путь к приложениям', pathToApp);

console.time('Конвертация меты закончена за');
getListOfAppliactionsMetaFiles(pathToApp)
  .then(createMetaAppWithMetaFilesList)
  .then(readMetaFiles)
  .then(convertMetaVersion)
  .then(writeMetaFiles)
  .then((metaApp) => {
    // 4debug console.log(util.inspect(metaApp,  {showHidden: true, depth: 3}));
    // console.log(util.inspect(metaApp.meta['khv-svyaz-info@typeAms'],  {showHidden: true, depth: 3}));
    // console.log(util.inspect(metaApp.navigation['khv-svyaz-info@svyazHK'],  {showHidden: true, depth: 2}));
    console.timeEnd('Конвертация меты закончена за');
  })
  .catch((err)=> {
    throw err;
  });

/**
 * Функция получения всех json файлов в папке метаданных
 * @param {String} folderOfApp  - путь к папке с приложениями
 * @returns {Promise}
 */
function getListOfAppliactionsMetaFiles(folderOfApp) {
  return new Promise(function (resolve, reject) {
    try {
      getDirAndFilesList(folderOfApp, {recurse: true,
        type: 'files',
        regexpFilesMask: new RegExp('.*[.](json$).*$', 'i')}, function (err, metaList) {
        resolve(metaList);
      });
    } catch (e) {
      console.error('Ошибка определения списка папок приложений с метой для конвертации', folderOfApp + ':', e);
      reject(e);
    }
  });
}

/**
 * Функция фильтрации файлов находящихся только в папках метаданных
 * @param {Object} listFilesInMetadataFolders  - объект с массивом со списком файлов с полным путем
 * @param {Array} listFilesInMetadataFolders.files  - массивом со списком файлов с полным путем
 * @returns {Promise} с объектом metaApp
 * {Object} metaApp - объект метаданных приложения
 * {Object} metaApp.meta - именованный массив объектов с метой и представлениями классов, имя - класс
 * {Object} metaApp.meta[].cls - класс меты
 * {Object} metaApp.meta[].cls.text - текстовое значение файла класса
 * {Object} metaApp.meta[].cls.fileName- путь к классу
 * {Object} metaApp.meta[].vwCreate - объект представления создания
 * {Object} metaApp.meta[].vwCreate.text - представление создания
 * {Object} metaApp.meta[].vwCreate.fileName - представление создания
 * {Object} metaApp.meta[].vwItem - объект представление формы
 * {Object} metaApp.meta[].vwItem.text - представление формы
 * {Object} metaApp.meta[].vwItem.fileName. - представление формы
 * {Object} metaApp.meta[].vwList - представление списка
 * {Object} metaApp.meta[].vwList.text - представление списка текст
 * {Object} metaApp.meta[].vwList.fileName - представление списка имя файла
 * {Object} metaApp.navigation - именованный массив объектос с навигацией, имя - секция
 * {Object} metaApp.navigation[].section - объект секции
 * {Object} metaApp.navigation[].section.text - текстовые файлы навигации
 * {Object} metaApp.navigation[].section.fileName - путь к файлу секции
 * {Object} metaApp.navigation[].menu - именованный маасив значений меню секции, имя код меню
 * {Object} metaApp.navigation[].menu[].text - текстовое значение файла меню
 * {Object} metaApp.navigation[].menu[].fileName - путь к файлу меню
 */
function createMetaAppWithMetaFilesList(listFilesInMetadataFolders) {
  return new Promise(function (resolve, reject) {
    try {
      let metaApp = {meta: {}, navigation: {}};
      let pathParsing;
      let metaPathFolder;
      let metaFolders;
      for (let i = 0; i < listFilesInMetadataFolders.files.length; i++) {
        pathParsing = path.parse(listFilesInMetadataFolders.files[i]); // Вытаскиваем дирректорию в пути
        metaPathFolder = pathParsing.dir.slice(pathToApp.length); // Обрезаем общие пути в метаданных
        metaFolders = metaPathFolder.split(path.sep); // Определям состав папок - нулевой элемент пустой, т.к. начало директории со слеша, первый содержит папку метаданных, второй папки внутри метаданных
        let className = metaFolders[1] + '@'; // Задайем префикс неймспейса у класса
        switch (metaFolders[2]){
          case 'meta':
            className += path.basename(listFilesInMetadataFolders.files[i], '.class.json');
            metaApp.meta[className] = metaApp.meta[className] ? metaApp.meta[className] :
                                                                {cls: {}, vwCreate: {}, vwItem: {}, vwList: {}};
            metaApp.meta[className].cls.fileName = listFilesInMetadataFolders.files[i];
            break;
          case 'views':
            className += metaFolders[3];
            metaApp.meta[className] = metaApp.meta[className] ? metaApp.meta[className] :
                                                                {cls: {}, vwCreate: {}, vwItem: {}, vwList: {}};
            switch (path.basename(listFilesInMetadataFolders.files[i], '.json')) {
              case 'create':
                metaApp.meta[className].vwCreate.fileName = listFilesInMetadataFolders.files[i];
                break;
              case 'item':
                metaApp.meta[className].vwItem.fileName = listFilesInMetadataFolders.files[i];
                break;
              case 'list':
                metaApp.meta[className].vwList.fileName = listFilesInMetadataFolders.files[i];
                break;
              default:
                console.error('Неожиданный тип представления %s в названии файла %s',
                  path.basename(listFilesInMetadataFolders.files[i], '.json'), listFilesInMetadataFolders.files[i]);
            }
            break;
          case 'navigation':
            let sectionName = metaFolders[1] + '@'; // Задайем префикс неймспейса у секции
            if (!metaFolders[3]) { // Анализ - секция или папка с меню
              sectionName += path.basename(listFilesInMetadataFolders.files[i], '.section.json');
              metaApp.navigation[sectionName] = metaApp.navigation[sectionName] ? metaApp.navigation[sectionName] :
                                                                                  {section: {}, menu: {}};
              metaApp.navigation[sectionName].section.fileName = listFilesInMetadataFolders.files[i];
            } else {
              sectionName += metaFolders[3];
              metaApp.navigation[sectionName] = metaApp.navigation[sectionName] ? metaApp.navigation[sectionName] :
                                                                                  {section: {}, menu: {}};
              let menuCode = path.basename(listFilesInMetadataFolders.files[i], '.json');
              metaApp.navigation[sectionName].menu[menuCode] = metaApp.navigation[sectionName].menu[menuCode] ?
                                                                  metaApp.navigation[sectionName].menu[menuCode] : {};
              metaApp.navigation[sectionName].menu[menuCode].fileName = listFilesInMetadataFolders.files[i];
            }

            break;
          default:
        }

      }

      resolve(metaApp);
    } catch (e) {
      console.error('Ошибка выделения списка файлов меты в прилжоениях ', e, '\n' + e.stack);
      reject(e);
    }
  });
}

/*
 * Функция поиска атрибута filename, счтиывания файла и присваивания его атрибуту text
 * в соответствии со структурой metaApp
 * @param structureOfMeta
 **/
function searchFileNameAndRead(structureOfMeta) {
  for (let key in structureOfMeta) {
    if (structureOfMeta.hasOwnProperty (key)) {
      if (key === 'fileName') {
        try {
          structureOfMeta.text = fs.readFileSync(structureOfMeta.fileName, 'utf8');// Если сразу парсить require(convertFilesList[i]);
        } catch (e) {
          throw e;
        }
      } else if (key !== 'text' && key !== 'obj') {
        searchFileNameAndRead(structureOfMeta[key]);
      }
    }
  }
}

/**
 * Считывание содержимого файлов
 * @param {Object} metaApp - объект метаданных приложения
 * @returns {Promise}
 */
function readMetaFiles(metaApp) {
  return new Promise(function (resolve, reject) {
    try {
      searchFileNameAndRead(metaApp);
    } catch (e) {
      console.error('Ошибка считывания файла\n' + e);
      reject(e);
    }
    resolve(metaApp);
  });
}

/**
 * Функция сортировки версий на основе пузырькового алгоритма
 * @param {Array} arr - массив с объектом семвер
 * @param {Object} arr.ver - строкове значение версии
 * @param {Array} arr.semVer = массив с элементами сем.вер
 * @returns {*}
 */
function bubbleSortSemVer(arr) {
  var arrLen = arr.length;
  for (var i = 0; i < arrLen - 1; i++) {
    for (var j = 0; j < arrLen - 1 - i; j++) {
      let verCompare = compareSemVer(arr[j + 1].ver, arr[j].ver);
      if (verCompare === -1) {
        let temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;    // На выходе сортированный по возрастанию массив A.
}

/*
 * Функция подготовки структуры конвезапуска конвертаций меты по версиям
 * @param {Object} metaApp - объект метаданных приложения
 * @returns {Promise}
 **/
function convertMetaVersion(metaApp) {
  return new Promise(function (resolve, reject) {
    let versionOrder = [];
    /**
     * Функций задания параметров порядка версий
     * @param {Object) metaItem - объект версии трансормации
     * @param {String) metaItem.transformateFunctionName - наименование функции трансфорации версии в файле tranformation.js
     */
    function createVersionOrder(metaItem) {
      if (metaItem.version) {
        versionOrder.push({
          ver: metaItem.version,
          functionName: metaItem.transformateFunctionName,
          tranformateObj: metaItem
        });
      }
    }
    try {
      // Поиск минимальной версии в метаданных - стартовый для конвертации
      let minMetaVersion = searchMinVersion(metaApp);
      console.info('Минимальная версия меты', minMetaVersion);

      // Формирования порядка версий
      metaVersion.forEach(createVersionOrder);
      versionOrder = bubbleSortSemVer(versionOrder);
      let versionList = [];
      let skipedVersionList = [];
      versionOrder.forEach((item) => {
        if (compareSemVer(minMetaVersion, item.ver) === -1) {
          versionList.push(item.ver);
        } else {
          skipedVersionList.push(item.ver);
        }
      });

      // Убираем версии, которые ниже самой маленькой в мете. Но это может не очень хорошо работать, когда конвертируем
      // несколько приложений сразу. Т.к. ищется минимальная для всех.
      for (let i = 0; i < skipedVersionList.length; i++) {
        versionOrder.shift();
      }
      console.info('Пропущены версии:', skipedVersionList.toString(), '\nПорядок обновления:', versionList.toString());
    } catch (e) {
      console.error('Ошибка подготовки версий меты\n' + e + '\n' + e.stack);
      reject(e);
    }
    try {
      // Конвертация
      versionOrder.forEach((item) => {
        metaApp = metaTextUpdate(metaApp, item.ver, item.tranformateObj.textUpdate);
        metaApp = metaObjectUpdate(metaApp, item.ver, item.tranformateObj.objectUpdate);
        if (transfMD[item.functionName]) {
          metaApp = transfMD[item.functionName](metaApp);
        }
      });
    } catch (e) {
      console.error('Ошибка конвертации меты\n' + e + '\n' + e.stack);
      reject(e);
    }
    resolve(metaApp);
  });
}

/**
 * Функция выполнения обработки текста метаданных
 * @param {Object} structureOfMeta - структура объекта метаданных приложения
 * @param {Object} metaVer - версия обновления меты
 * @param {Object} textUpdate - операции над текстом
 * @param {Array} textUpdate.replaceRegexp - массив с парой на замену. Значения: массив массивов из двух элементов -
 *                                           в первом regexp в виде строки, выполняемый глобально для поиска текста на
 *                                           замену, второй элемент - строка на замену.
 * @returns {Promise} metaApp
 **/
function metaTextUpdate(structureOfMeta, metaVer, textUpdate) {
  if (!textUpdate) {
    console.info('В версии' +
      ' меты %s, нет данных для обновления текста. Пропускаем.', metaVer);
  } else {
    for (let key in structureOfMeta) {
      if (structureOfMeta.hasOwnProperty(key)) {
        if (key === 'text') {
          let textMetaVersion = searchMinVersion(structureOfMeta);
          if (compareSemVer(textMetaVersion, metaVer) === -1) {
            try {
              // 4debug console.info('Обновлеяем', structureOfMeta.fileName, textMetaVersion, '=>', metaVer);
              if (textUpdate.replaceRegexp) {
                textUpdate.replaceRegexp.forEach((replaceItem) => {
                  structureOfMeta[key] = structureOfMeta[key].replace(new RegExp(replaceItem[0], 'g'), replaceItem[1]);
                });
              }
            } catch (e) {
              console.error('Ошибка конвертации данных меты', structureOfMeta.fileName + '\n' + e + '\n' + e.stack);
            }
          }
        } else if (key !== 'fileName' && key !== 'obj') {
          structureOfMeta[key] = metaTextUpdate(structureOfMeta[key], metaVer, textUpdate);
        }
      }
    }
  }
  return structureOfMeta;
}

/**
 * Функция конвертирования на основе логики
 * @param srcValue - исходное значение
 * @param {String} valueNewType - новый тип значение
 * @param {Array} typeParam - параметры конвертации типов
 * @return newValue - сконверитрованное значение

 */
function metaTypeConvert(srcValue, valueNewType, typeParam) {
  let newValue;
  if (typeof srcValue === valueNewType && valueNewType !== 'array' ||
      Array.isArray(srcValue) && valueNewType === 'array') {
    newValue = srcValue;
  } else if (valueNewType === 'null') { // Для null упрощенная обработка
    newValue = null;
  } else if (valueNewType === 'boolean') { // Для логических упрощенная обработка, кроме строк
    newValue = Boolean(srcValue);
  } else if (valueNewType === 'number') { // Для чисел упрощенная обработка
    newValue = Number(valueNewType);
  } else {
    switch (valueNewType) {
      case 'string':
        switch (typeof srcValue) {
          case 'null':
            newValue = '';
            break;
          case 'boolean':
            if (typeParam && typeParam.length !== 2) {
              newValue = srcValue ? typeParam[0] : typeParam[1];
            } else {
              newValue =  String(srcValue);
            }
            break;
          case 'number':
            newValue = String(srcValue);
            break;
          case 'object':
            if (typeParam && typeParam.length) { // В typeParam - содержатся индексы массива, которые конвертируются
              let tempArray = [];
              if (Array.isArray(srcValue)) {
                for (let i = 0; i < typeParam.length; i++) {
                  for (let j = 0; j < srcValue.length; j++) {
                    if(typeParam[i] === srcValue[j]) {
                      tempArray.push(srcValue[j]);
                    }
                  }
                }
              } else { // В параметрах хранятся индексы вложенных объектов
                for (let i = 0; i < typeParam.length; i++) {
                  let keyIndex = typeParam[i].split('.');
                  let resultValue = keyIndex[0];
                  for (let j = 1; j < keyIndex.length; j++) {
                    resultValue = resultValue[keyIndex[j]];
                  }
                  tempArray.push(resultValue);
                }
              }
              newValue = tempArray.toString();
            } else {
              newValue =  String(srcValue);
            }
            break;
          default:
            console.warn('Не поддерживаемая конвертация из %s в %s', typeof srcValue, valueNewType);
        }
        break;
      case 'array':
        switch (typeof srcValue) {
          case 'null':
            newValue = [];
            break;
          case 'string': // Параметр - разделитель. TODO Возможно лучше перейти на регэксп
            if (typeParam && typeParam.length) {
              newValue = srcValue.split(typeParam[0]);
            } else {
              newValue = [srcValue];
            }
            break;
          case 'boolean':
            newValue = [srcValue];
            break;
          case 'number':
            newValue = [srcValue];
            break;
          case 'object':
            if (typeParam && typeParam.length) { // В typeParam - содержатся индексы массива, которые конвертируются
              let tempArray = [];
              for (let i = 0; i < typeParam.length; i++) {
                let keyIndex = typeParam[i].split('.');
                let resultValue = keyIndex[0];
                for (let j = 1; j < keyIndex.length; j++) {
                  resultValue = resultValue[keyIndex[j]];
                }
                tempArray.push(resultValue);
              }
              newValue = tempArray;
            } else {
              newValue =  [srcValue];
            }
            break;
          default:
            console.warn('Не поддерживаемый конвертация из %s в %s', typeof srcValue, valueNewType);
        }
        break;
      case 'object': // Нужна или можно упрощенным способом
        if (typeParam && typeParam.length) { // В параметре имя свойства, которому присваивается
          newValue[typeParam[0]] = srcValue;
        } else {
          newValue = {};
        }
        console.warn('Не поддерживаемый конвертация из %s в %s', typeof srcValue, valueNewType);
        break;
      default:
        console.warn('Не поддерживаемый тип конвертации', valueNewType);
    }
  }
  return newValue;
}

/**
 * Функционя распарсивания и обновления свойств объекта
 * @param {String} metaName - имя класса и тип
 * @param {String} textMetaObject - обновляемый объект в текстовом формате
 * @param {Object} objectUpdate - свойства обновления
 * @return {String} textMetaObject - текстовое значение объекта
 */
function objectUpdateProperty(metaName, textMetaObject, objectUpdate) {
  let metaObject;
  try {
    metaObject = JSON.parse(textMetaObject);
  } catch (e) {
    console.error('Ошибка конвертации данных меты', textMetaObject + '\n' + e + '\n' + e.stack);
  }
  metaObject = objectPropertyAction(metaName, metaObject, objectUpdate);

  try {
    textMetaObject = JSON.stringify(metaObject, null, 2);
  } catch (e) {
    console.error('Ошибка конвертации данных меты в текст', metaObject + '\n' + e + '\n' + e.stack);
  }
  return textMetaObject;
}

/**
 * Функция обновления свойст объекта по заданным действиям
 * @param {String} metaName - имя класса и тип
 * @param {Object}metaObject - обновляемый фрагмент объекта
 * @param {Object} objectUpdate - свойства обновления
 * @returns {Object} metaObject - обновленный фрагмент объекта
 */
function objectPropertyAction(metaName, metaObject, objectUpdate) {
  // Обновляем свойства самого объекта
  for (let classParam in metaObject) {
    if (metaObject.hasOwnProperty(classParam)) {
      // Удаление атрибутов
      if (objectUpdate.delete && objectUpdate.delete.length) {
        objectUpdate.delete.forEach((item) => {
          if (classParam === item) {
            delete metaObject[classParam];
          }
        });
      }
      // Переименование атрибутов
      if (objectUpdate.rename && objectUpdate.rename.length) {
        objectUpdate.rename.forEach((item) => {
          if (classParam === item.propertyName && item.propertyNewName) {
            metaObject[item.propertyNewName] = metaObject[classParam];
            delete metaObject[classParam];
          }
        });
      }
      // Запрещенные значения
      if (objectUpdate.depricatedValue && objectUpdate.depricatedValue.length) {
        objectUpdate.depricatedValue.forEach((item) => {
          if (classParam === item.propertyName && (typeof item.value === 'undefined' || item.value === null)) { // Вариант !item.value не работает, т.к. значение может быть 0 или false
            console.warn('Запрещеноe свойство %s в мете %s. Необходимо обработать вручную', item.propertyName, metaName);
          } else if (classParam === item.propertyName && metaObject[classParam] === item.value) {
            console.warn('Запрещеное значение %s свойства %s в мете %s. Необходимо обработать вручную', item.value,
              item.propertyName, metaName);
          }
        });
      }
      // Конвертация типов значений
      if (objectUpdate.convertType && objectUpdate.convertType.length) {
        objectUpdate.convertType.forEach((item) => {
          if (classParam === item.propertyName) {
            metaObject[classParam] = metaTypeConvert (metaObject[classParam], item.valueNewType, item.param);
          }
        });
      }
    }
  }
  // Добавление атрибутов
  if (objectUpdate.new && objectUpdate.new.length) {
    objectUpdate.new.forEach((item) => {
      if (item.propertyName) {
        if (!metaObject[item.propertyName]) {
          metaObject[item.propertyName] = typeof item.value === 'undefined' ? null : item.value;
        } else {
          console.warn('Свойство %s уже есть в', item.propertyName, metaName);
        }
      } else {
        console.warn('Отсутствует имя нового свойства propertyName', item);
      }
    });
  }
  // Обновление составных свойст объекта метаданных
  if (objectUpdate.compositeProperty && typeof objectUpdate.compositeProperty === 'object') {
    for (let compositeKey in objectUpdate.compositeProperty) {
      if (objectUpdate.compositeProperty.hasOwnProperty(compositeKey) && typeof metaObject[compositeKey] === 'object') {
        if (Array.isArray(metaObject[compositeKey])) {
          for (let i = 0; i < metaObject[compositeKey].length; i++) {
            metaObject[compositeKey][i] = objectPropertyAction(metaName, metaObject[compositeKey][i], objectUpdate.compositeProperty[compositeKey]) // TODO Нужно вынести за конвертацию в JSON  в отдельную функцию

          }
        } else {
          metaObject[compositeKey] = objectPropertyAction(metaName, metaObject[compositeKey], objectUpdate.compositeProperty[compositeKey]) // TODO Нужно вынести за конвертацию в JSON  в отдельную функцию
        }
      }
    }
  }
  return metaObject;
}

/**
 * Функция выполнения обработки текста метаданных
 * @param {Object} metaApp - структура объекта метаданных приложения
 * @param {Object} metaVer - версия обновления меты
 * @param {Object} objectUpdate - операции над объектами
 * @param {Object} objectUpdate.class - набор операций над свойствами класса
 * @param {Array} objectUpdate.class.delete - Свойства класса к удалению. Значения: массив строк с именем свойств объекта
 * @param {Array} objectUpdate.class.new - Свойства класса к удалению. Значения: массив строк с именем свойств объекта
 * @param {Array} objectUpdate.class.convertType - Список свойств класса к конвертации типов значений, конвертация типов осуществляется на основе параметров для пар конвертации и типовых преобразования JS
 * @param {Array} objectUpdate.class.depricatedValue - массив свойств и их значений, которые запрещены к использованию и не могут быть сконвертированны
 * @returns {Promise} metaApp
 **/
function metaObjectUpdate(metaApp, metaVer, objectUpdate) {
  if (!objectUpdate) {
    console.info('В версии меты %s, нет данных для обновления объектов. Пропускаем.', metaVer);
  } else {
    if (metaApp.meta) {
      for (let key in metaApp.meta) { // Обновляем мету
        if (metaApp.meta.hasOwnProperty(key)) {
          if (metaApp.meta[key].cls && metaApp.meta[key].vwCreate &&  // Избыточная проверка, т.к. всегда есть эти объекты.
              metaApp.meta[key].vwItem && metaApp.meta[key].vwList) { // Но может не быть текстовых, например есть представление, но нет класса
            if (metaApp.meta[key].cls.text && objectUpdate.class) { // Конвертора для объектов класса
              let textMetaVersion = searchMinVersion(metaApp.meta[key].cls);
              if (compareSemVer(textMetaVersion, metaVer) === -1) {
                metaApp.meta[key].cls.text = objectUpdateProperty('Класс ' + key, metaApp.meta[key].cls.text,
                                                                                  objectUpdate.class);
              }
            }
            if (metaApp.meta[key].vwCreate.text && objectUpdate.views) { // Конвертор для объектов представления создания
              let textMetaVersion = searchMinVersion(metaApp.meta[key].vwCreate);
              if (compareSemVer(textMetaVersion, metaVer) === -1) {
                metaApp.meta[key].vwCreate.text = objectUpdateProperty('Представление создания ' + key,
                  metaApp.meta[key].vwCreate.text, objectUpdate.views);
              }
            }
            if (metaApp.meta[key].vwItem.text && objectUpdate.views) { // Конвертор для объектов представления создания
              let textMetaVersion = searchMinVersion(metaApp.meta[key].vwItem);
              if (compareSemVer(textMetaVersion, metaVer) === -1) {
                metaApp.meta[key].vwItem.text = objectUpdateProperty('Представление редактирования ' + key,
                  metaApp.meta[key].vwItem.text, objectUpdate.views);
              }
            }
            if (metaApp.meta[key].vwList.text && objectUpdate.views) { // Конвертор для объектов представления создания
              let textMetaVersion = searchMinVersion(metaApp.meta[key].vwList);
              if (compareSemVer(textMetaVersion, metaVer) === -1) {
                metaApp.meta[key].vwList.text = objectUpdateProperty('Представление списка ' + key,
                  metaApp.meta[key].vwList.text, objectUpdate.views);
              }
            }
          } else {
            console.log('Некорректная структура в сформированной мете', key, '\n', metaApp.meta[key]);
          }
        }
      }
    }
    if (metaApp.navigation) {
      for (let key in metaApp.navigation) { // Обновляем навигацию
        if (metaApp.navigation.hasOwnProperty(key)) {
          if (metaApp.navigation[key].section && metaApp.navigation[key].menu) {
            if (metaApp.navigation[key].section.text && objectUpdate.section) { // Конвертора секций
              let textMetaVersion = searchMinVersion(metaApp.navigation[key].section);
              if (compareSemVer(textMetaVersion, metaVer) === -1) {
                metaApp.navigation[key].section.text = objectUpdateProperty('Секция ' + key,
                  metaApp.navigation[key].section.text, objectUpdate.section);
              }
            }
            for (let keyMenu in metaApp.navigation[key].menu) { // Конвертора для пунктов меню
              if (metaApp.navigation[key].menu.hasOwnProperty(keyMenu)) {
                if (metaApp.navigation[key].menu[keyMenu].text && objectUpdate.menu) {
                  let textMetaVersion = searchMinVersion(metaApp.navigation[key].menu[keyMenu]);
                  if (compareSemVer(textMetaVersion, metaVer) === -1) {
                    metaApp.navigation[key].menu[keyMenu].text = objectUpdateProperty('Меню ' + key,
                      metaApp.navigation[key].menu[keyMenu].text, objectUpdate.menu);

                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return metaApp;
}

/*
 * Функция поиска атрибута filename, и сохранения значения файла из атрибута атрибута text
 * в соответствии со структурой metaApp
 * @param structureOfMeta
 **/
function searchFileNameAndWrite(structureOfMeta) {
  for (let key in structureOfMeta) {
    if (structureOfMeta.hasOwnProperty (key)) {
      if (key === 'fileName') {
        try {
          if (structureOfMeta.text) {
/*            let pathParsing = path.parse(structureOfMeta.fileName); // Вытаскиваем дирректорию в пути
            let metaPathFolder = pathParsing.dir.slice(pathToApp.length); // Обрезаем общие пути в метаданных
            let name = path.join('c:\\temp\\test', metaPathFolder, pathParsing.base + '.0');
            fs.writeFileSync(name, structureOfMeta.text, 'utf8');*/
            fs.writeFileSync(structureOfMeta.fileName, structureOfMeta.text, 'utf8');
          }
        } catch (e) {
          throw e;
        }
      } else if (key !== 'text' && key !== 'obj') {
        searchFileNameAndWrite(structureOfMeta[key]);
      }
    }
  }
}

/**
 * Сохранение содержимого файлов
 * @param {Object} metaApp - объект метаданных приложения
 * @returns {Promise}
 */
function writeMetaFiles(metaApp) {
  return new Promise(function (resolve, reject) {
    try {
      searchFileNameAndWrite(metaApp);
    } catch (e) {
      console.error('Ошибка записи файла\n' + e + '\n' + e.stack);
      reject(e);
    }
    resolve(metaApp);
  });
}

/*
 * Функция получения списка файлов и дирректорий, по параметрам
 * param = {
 *   recurse: true | false или цифра // рекурсивный поиск, или только в директории назначения.
 *                                // Цифра - глубинра поиска. По умолчанию только в дирректории
 *   type: files, dir, full // результат со списком файлов, дирректории или полный. По умолчанию полный.
 *   regexpFilesMask: '' - строка с regexp выражением, для отбора файлов. По умолчанию все файлы
 * }
 * result = {
 *   dir = [],
 *   files = []
 * }
 */
function getDirAndFilesList(pathInitDataFolder, param, done) {
  if (typeof pathInitDataFolder === 'function' && typeof param === 'undefined') {
    done = pathInitDataFolder;
    pathInitDataFolder = __dirname;
    param = {
      recurse: false,
      type: 'full'
    };
  } else if (typeof param === 'function' && typeof done === 'undefined') {
    done = param;
    param = {
      recurse: false,
      type: 'full'
    };
  }
  var RECURSE = param.recurse ? true : false;
  var GET_DIR = param.type === 'dir' || param.type === 'full' ? true : false;
  var GET_FILES = param.type === 'files' || param.type === 'full' ? true : false;
  var FILES_MASK = param.regexpFilesMask || null;
  var results = {
    dir: [],
    files: []
  };
  var pending;
  var recurseRuns = 0;
  var recurseParam;

  try {
    fs.readdir(pathInitDataFolder, function (err, list) {
      try {
        assert.equal(err, null);// 'При чтении структуры дирректорий произошла ошибка: ' + err.message);
        pending = list.length;
        if (!pending) {
          done(null, results); // Можно возвращать другой тип, например false - но тогда проверки могут не работать
        }
        list.forEach(function (file) {
          file = path.resolve(pathInitDataFolder, file);
          fs.stat(file, function (err, stat) {
            try {
              assert.equal(err, null);// 'При получении данных файла произошла ошибка');
              if (stat.isDirectory()) {
                if (GET_DIR) {
                  results.dir.push(file);
                }
                if (RECURSE) {
                  recurseRuns++; // Увеличиваем, т.к. уменьшается не дожидаясь выполнения вложенной функции
                  if (typeof param.recurse === 'number' && param.recurse > 0) {
                    recurseParam = param.recurse - 1;
                  } else {
                    recurseParam = param.recurse;
                  }
                  getDirAndFilesList(file, {
                      recurse: recurseParam,
                      type: param.type,
                      regexpFilesMask: param.regexpFilesMask
                    },
                    function (err, res) {
                      if (err) {
                        done(err); // При ошибка будет несколько раз вызывать калбэк, надо отлавливать.
                      } else {
                        results.dir = results.dir.concat(res.dir);
                        results.files = results.files.concat(res.files);
                        recurseRuns--;
                        if (!pending && !recurseRuns) {
                          done(null, results);
                        }
                      }
                    });
                }
              } else if (stat.isFile()) {
                if (GET_FILES) {
                  if (FILES_MASK) {
                    if (file.search(FILES_MASK) !== -1) {
                      results.files.push(file);
                    }
                  } else {
                    results.files.push(file);
                  }
                }
              }
            } finally {
              pending--;
              if (!pending && !recurseRuns) {
                done(null, results);
              }
            }
          });
        });
      } catch (err) {
        done(err);
      }
    });
  } catch (err) {
    done(err);
  }
}
