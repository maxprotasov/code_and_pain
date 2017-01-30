'use strict';

/*eslint-disable no-unused-vars*/
function getMessage(a, b) {
/*eslint-enable no-unused-vars*/

  if (typeof a === 'boolean') {
    return a ? 'Я попал в ' + b : 'Я никуда не попал';
  }

  if (typeof a === 'number') {
    return 'Я прыгнул на ' + a * 100 + ' сантиметров';
  }

  if (Array.isArray(a) && !Array.isArray(b)) {
    var numberOfSteps = a.reduce(function(sum, current) {
      return sum + current;
    });
    return 'Я прошёл ' + numberOfSteps + ' шагов';
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    var distancePath = a.reduce(function(sum, current, i) {
      return sum + current * b[i];
    }, 0);
    return 'Я прошёл ' + distancePath + ' метров';
  }

  return 'Переданы некорректные данные';
}
