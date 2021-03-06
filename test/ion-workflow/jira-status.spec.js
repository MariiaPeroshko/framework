/**
* Тестируем проверку статусов тасков Jira для веток
*/

'use strict';

const fs = require('fs');
const path = require('path');
const TRUE_STATUS = ['Мердж', 'Версия'];

if (!process.env.ION_JIRA_USER || !process.env.ION_JIRA_PASSWORD) {
  console.warn('Тест пропущен, т.к. не заданы учетные данны для джира в ION_JIRA_USER и ION_JIRA_PASSWORD');
}

describe('# Проверка статуса бизнес-процесса по задаче "мердж"', function () {
  this.timeout(60000);
  it('Для текущей ветки в гит, должен быть установлен статус "Мердж" или "Версия" в Jira', (done) => {
    if (process.env.CI_COMMIT_REF_SLUG) {
      checkEnvBranch(done);
    } else {
      checkGitBranch(done);
    }
  });
});

/**
 * Функция проверки через ветки указанные в гит
 * @param {Function} done - калбек успешности теста
 */
function checkGitBranch(done) {
  try {
    let foldersToGitCheck = [path.join(__dirname, '../..')];
    foldersToGitCheck = foldersToGitCheck.concat(getFolderInDir(path.join(__dirname, '../../applications')),
      getFolderInDir(path.join(__dirname, '../../modules')));
    let tasksCodeToCheck = [];
    let qntCheckRes = 0;
    let onceErr = false;
    foldersToGitCheck.forEach((folder) => {
      const branchName = fs.readFileSync(path.join(folder, '.git/HEAD'))
        .toString()
        .replace('\n', '')
        .split('/');
      let taskCode =  branchName[branchName.length - 1].split('_')[0];
      if (/^([A-Za-z]+)-(\d+)/i.test(taskCode) &&  tasksCodeToCheck.indexOf(taskCode) === -1) {
        tasksCodeToCheck.push(taskCode);
        setTimeout(() => {
          if (!onceErr) { // Если ошибка уже была, прекращаем новые запросы
            checkMergeStatus(taskCode)
              .then((status) => {
                console.log('Компонент ' + folder + ' с веткой задачи ' + taskCode + ' имеет статус:', status);
                if (!onceErr && TRUE_STATUS.includes(status)) {
                  onceErr = true;
                  done(new Error('Компонент ' + folder + ' с веткой задачи ' + taskCode + ' имеет статус ' + status +
                    ' вместо Мердж или Версия'));
                }
                if (!onceErr && ++qntCheckRes === tasksCodeToCheck.length) {
                  console.log('Проверенные статусы Мердж/Версия у задач:', tasksCodeToCheck.toString());
                  done();
                }
              })
              .catch((e) => {
                console.log('Ошибка осуществления запросов в Jira, пропускаем тестирование\n', e);
                done();
              });
          }
        }, 1000 * (tasksCodeToCheck.length - 1));

      } else {
        console.log('Компонент ' + folder + ' в ветке ' + taskCode + ' не соодержит признаков задачи');
      }
    });
  } catch (e) {
    console.log('Ошибка формирования папок гит, пропускаем тестирование\n', e);
    done();
  }
}

/**
 * Функция проверки через ветки указанные в переменной окружения
 * @param {Function} done - калбек успешности теста
 */
function checkEnvBranch(done) {
  let taskCode =  process.env.CI_COMMIT_REF_SLUG.split('_')[0];
  checkMergeStatus(taskCode)
    .then((status) => {
      console.log('Компоненты с веткой задачи ' + taskCode + ' имеет статус:', status);
      if (TRUE_STATUS.includes(status)) {
        done(new Error('Компоненты с веткой задачи ' + taskCode + ' имеет статус ' + status +
          ' вместо Мердж иди Версия'));
      } else {
        console.log('Проверенные статусы Мердж/Версия у задачи', taskCode);
        done();
      }
    })
    .catch((e) => {
      console.log('Ошибка осуществления запросов в Jira, пропускаем тестирование\n', e);
      done();
    });
}

/**
 * Функция получения списка дирректорий в указанном каталоге
 * @param {String} dir
 * @returns {Array}
 */
function getFolderInDir(dir) {
  let folders = [];
  try {
    fs.accessSync(dir, fs.constants.F_OK);
    let files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
      let fn = path.join(dir, files[i]);
      let stat = fs.lstatSync(fn);
      if (stat.isDirectory()) {
        folders.push(fn);
      }
    }
  } catch (e) {
    throw e;
  }
  return folders;
}

/**
 * Функция проверки статуса для таска
 * @param {String} taskCode - код таска в джире
 * @return {Promise}
 */
function checkMergeStatus(taskCode) {
  const https = require('https');
  return new Promise(function (resolve, reject) {
    https.get({hostname: 'ion-dv.atlassian.net',
      path: '/rest/api/2/issue/' + taskCode,
      auth: process.env.ION_JIRA_USER + ':' + process.env.ION_JIRA_PASSWORD}, (res) => {
      let onceErr = false;
      if (res.statusCode !== 200) {
        reject(new Error('Ошибка запроса, код ответа ' + res.statusCode));
        onceErr = true;
      }
      res.on('data', (d) => {
        if (!onceErr) { // Если уже было сообщение об ошибке, не нужно проверять
          let regexpMerge = /(?:"status":.+?"name": ?")([А-Яа-яЕёA-Za-z]*)/i;   // Альтернатива id вместо name
          let status = 'Ошибка поиска статуса';
          try {
            let data = d.toString();
            let isMerge = data.match(regexpMerge);
            if (isMerge && isMerge[1]) {
              status = isMerge[1];
            }
          } catch (e) {
            console.error('Ошибка парсинга ответа Jira\n', e, '\n', d.toString());
          }
          finally {
            resolve(status);
          }
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}
