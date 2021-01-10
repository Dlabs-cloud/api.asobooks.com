export function zeroFills(numberVal, width) {
  width = width -= numberVal.toString().length;

  if (width > 0) {
    return new Array(width + (/\./.test(numberVal) ? 2 : 1)).join('0') + numberVal;
  }

  return numberVal + '';
}

export function isEmail(email): boolean {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export function getMonthDateRange(year, month) {
  const moment = require('moment');

  // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
  // array is 'year', 'month', 'day', etc
  const startDate = moment([year, month - 1]);

  // Clone the value before .endOf()
  const endDate = moment(startDate).endOf('month');

  // make sure to call toDate() for plain JavaScript date type
  return { start: startDate.toDate(), end: endDate.toDate() };
}

