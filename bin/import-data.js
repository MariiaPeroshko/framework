'use strict';
/* eslint no-process-exit:off, no-sync:off */
/**
 * Created by krasilneg on 21.03.19.
 */
const dataImporter = require('lib/import-data');
const config = require('../config');
const di = require('core/di');
const IonLogger = require('core/impl/log/IonLogger');
const errorSetup = require('core/error-setup');
const alias = require('core/scope-alias');
const extend = require('extend');
errorSetup(config.lang || 'ru');

var sysLog = new IonLogger(config.log || {});

var params = {
  src: '../in/data',
  ns: null,
  ignoreIntegrityCheck: true
};

let setParam = null;

process.argv.forEach(function (val) {
  if (val === '--ignoreIntegrityCheck') {
    console.warn('При импорте игнорируется целостность данных, возможны ошибки в БД');
    params.ignoreIntegrityCheck = true;
  } else if (val.substr(0, 2) === '--') {
    setParam = val.substr(2);
  } else if (setParam) {
    params[setParam] = val;
  }
});

// Связываем приложение
di('boot', config.bootstrap,
  {
    sysLog: sysLog
  }, null, ['rtEvents'])
  .then(scope =>
    di(
      'app',
      di.extract(
        ['dbSync', 'metaRepo', 'dataRepo', 'workflows', 'sequenceProvider'],
        extend(true, config.di, scope.settings.get('plugins') || {})
      ),
      {},
      'boot',
      ['auth', 'application']
    )
  )
  .then(scope => alias(scope, scope.settings.get('di-alias')))
  .then(scope =>
    dataImporter(
      params.src,
      {
        metaRepo: scope.metaRepo,
        dataRepo: scope.dataRepo,
        workflows: scope.workflows,
        sequences: scope.sequenceProvider,
        log: sysLog,
        namespace: params.ns,
        ignoreIntegrityCheck: params.ignoreIntegrityCheck
      }).then(() => scope)
  )
  .then(scope => scope.dataSources.disconnect())
  .then(() => {
    console.info('Импорт данных выполнен успешно.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(130);
  });
