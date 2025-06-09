import {Filters} from './constants.js';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import durationPlugin from 'dayjs/plugin/duration';

dayjs.extend(durationPlugin);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const current = dayjs();

export const getRandomStr = (length = 12) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
};

const compareNullValues = (first, second) => {
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
  const weight = compareNullValues(first.dateFrom, second.dateFrom);
  return weight ?? dayjs(first.dateFrom).diff(dayjs(second.dateFrom));
};

export const sortByTime = (first, second) => {
  const durationF = dayjs(first.dateTo).diff(dayjs(first.dateFrom));
  const durationS = dayjs(second.dateTo).diff(dayjs(second.dateFrom));
  return durationS - durationF;
};

export const sortByPrice = (first, second) => second.basePrice - first.basePrice;

export const formatMonthDay = (date) => {
  if (!date) {
    return '';
  }
  return dayjs(date).format('MMM DD');
};

export const formatHourMinute = (date) => {
  if (!date) {
    return '';
  }
  return dayjs(date).format('HH:mm');
};

export const formatDuration = (dateFrom, dateTo) => {
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const difference = end.diff(start);

  if (difference <= 0) {
    return '00M';
  }

  const eventDuration = dayjs.duration(difference);

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


export const filterPointsByTime = {
  [Filters.EVERYTHING]: (points) => points,
  [Filters.FUTURE]: (points) => points.filter((point) => dayjs(point.dateFrom).isAfter(current)),
  [Filters.PRESENT]: (points) => points.filter((point) => dayjs(point.dateFrom).isSameOrBefore(current) && dayjs(point.dateTo).isSameOrAfter(current)),
  [Filters.PAST]: (points) => points.filter((point) => dayjs(point.dateTo).isBefore(current)),
};

export const encodeHtml = (unsafe) => {
  if (unsafe === null || typeof unsafe === 'undefined') {
    return '';
  }
  if (typeof unsafe === 'number') {
    return String(unsafe);
  }
  if (typeof unsafe !== 'string') {
    unsafe = String(unsafe);
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const checkImageUrl = (url) => {
  if (typeof url !== 'string') {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://') || (!url.startsWith('//') && !url.includes(':'));
};
