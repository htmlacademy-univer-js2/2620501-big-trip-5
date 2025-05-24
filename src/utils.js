export const getRandomInt = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export const sortByDay = (first, second) => {
  if (first.dateFrom === null && second.dateFrom === null) {
    return 0;
  }
  if (first.dateFrom === null) {
    return 1;
  }
  if (second.dateFrom === null) {
    return -1;
  }

  const firstDate = new Date(first.dateFrom).getTime();
  const secondDate = new Date(second.dateFrom).getTime();
  return firstDate - secondDate;
};

export const sortByTime = (first, second) => {
  const firstDuration = new Date(first.dateTo).getTime() - new Date(first.dateFrom).getTime();
  const secondDuration = new Date(second.dateTo).getTime() - new Date(second.dateFrom).getTime();
  return secondDuration - firstDuration;
};

export const sortByPrice = (first, second) => second.basePrice - first.basePrice;
