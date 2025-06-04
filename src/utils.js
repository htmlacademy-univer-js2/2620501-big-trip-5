import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
dayjs.extend(durationPlugin);

export const getRandomInt = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export const getForNull = (first, second) => {
  if (first === null && second === null) {
    return 0;
  }
  if (first === null) {
    return 1;
  }
  if (second === null) {
    return -1;
  }
  return null;
};

export const sortByDay = (first, second) => {
  const weight = getForNull(first.dateFrom, second.dateFrom);
  return weight ?? dayjs(first.dateFrom).diff(dayjs(second.dateFrom));
};

export const sortByTime = (first, second) => {
  const firstDuration = dayjs(first.dateTo).diff(dayjs(first.dateFrom));
  const secondDuration = dayjs(second.dateTo).diff(dayjs(second.dateFrom));
  return secondDuration - firstDuration;
};

export const sortByPrice = (first, second) => second.basePrice - first.basePrice;

export const formatingMonthDay = (date) => {
  if (!date) {
    return '';
  }
  return dayjs(date).format('MMM DD');
};

export const formatingHourMinute = (date) => {
  if (!date) {
    return '';
  }
  return dayjs(date).format('HH:mm');
};

export const formatingDuration = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) {
    return '';
  }
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const differense = end.diff(start);

  if (differense <= 0) {
    return '00M';
  }

  const eventDuration = dayjs.duration(differense);

  const days = eventDuration.days();
  const hours = eventDuration.hours();
  const minutes = eventDuration.minutes();

  if (days > 0) {
    return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }
  return `${String(minutes).padStart(2, '0')}M`;
};
