'use strict';
/* eslint no-process-exit:off */
/**
 * Created by kras on 24.08.16.
 */
const config = require('../config');
const di = require('core/di');
const IonLogger = require('core/impl/log/IonLogger');
const errorSetup = require('core/error-setup');
const alias = require('core/scope-alias');
const extend = require('extend');
errorSetup(config.lang || 'ru');

var sysLog = new IonLogger({});

var name = 'admin';
var pwd = 'admin';

var setName = false;
var setPwd = false;

process.argv.forEach(function (val) {
  if (val === '--name') {
    setName = true;
    setPwd = false;
    return;
  } else if (val === '--pwd') {
    setPwd = true;
    setName = false;
    return;
  } else if (setName) {
    name = val;
  } else if (setPwd) {
    pwd = val;
  }
  setName = false;
  setPwd = false;
});

// Связываем приложение
di('boot', config.bootstrap,
  {
    sysLog: sysLog
  }, null, ['rtEvents'])
  .then(scope =>
    di(
      'app',
      di.extract(['auth'], extend(true, config.di, scope.settings.get('plugins') || {})),
      {},
      'boot',
      ['application']
    )
  )
  .then(scope => alias(scope, scope.settings.get('di-alias')))
  .then(scope =>
    new Promise((resolve, reject) => {
      scope.auth.register(
        {
          name: name,
          pwd: pwd
        },
        err => err ? reject(err) : resolve(scope)
      );
    })
  )
  .then(scope => scope.dataSources.disconnect())
  .then(() => {
    console.info('Пользователь успешно зарегистрирован.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(130);
  });
