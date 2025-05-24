import {getRandomInt} from '../utils.js';

export const TYPE = ['bus', 'drive', 'taxi', 'train', 'flight', 'ship', 'check-in','restaurant', 'sightseeing'];

export const DESTINATION = [
  {
    id: 1,
    description: 'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva).',
    name: 'Geneva',
    pictures: [
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInt(1, 100)}`,
        description: 'Geneva parliament building'
      }
    ]
  },
  {
    id: 2,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    name: 'Amsterdam',
    pictures: [
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInt(1, 100)}`,
        description: 'Amsterdam canal'
      }
    ]
  }
];

export const EXTRA_TYPE = {
  'taxi': [
    {
      id: 1,
      title: 'Order Uber',
      price: 20
    },
    {
      id: 2,
      title: 'Choose radio station',
      price: 5
    }
  ],
  'flight': [
    {
      id: 3,
      title: 'Add luggage',
      price: 50
    },
    {
      id: 4,
      title: 'Switch to comfort',
      price: 80
    }
  ]
};

let pointId  = 0;
const uniqueId = () => pointId ++;

export const generatePoint = () => {
  const type = TYPE[getRandomInt(0, TYPE.length - 1)];
  const availableOffers = EXTRA_TYPE[type] || [];

  const startDate = new Date('2023-10-01T00:00:00.000Z');
  const setDay = getRandomInteger(0, 10);
  const setHour = getRandomInteger(8, 18);
  const setMinute = getRandomInteger(0, 59);
  const dateFrom = new Date(startDate);

  dateFrom.setDate(startDate.getDate() + setDay);
  dateFrom.setUTCHours(setHour, setMinute, 0, 0);

  const durationHours = getRandomInteger(1, 5);
  const durationMinutes = getRandomInteger(0, 59);
  const dateTo = new Date(dateFrom);
  dateTo.setUTCHours(dateFrom.getUTCHours() + durationHours, dateFrom.getUTCMinutes() + durationMinutes, 0, 0);

  return {
    basePrice: getRandomInt(20, 1000),
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    destination: DESTINATION[getRandomInt(0, DESTINATION.length - 1)].id,
    id: uniqueId(),
    isFavorite: Boolean(getRandomInt(0, 1)),
    offers: availableOffers.length ?
      [availableOffers[getRandomInt(0, availableOffers.length - 1)].id] : [],
    type
  };
};

export const generateRoutePoint = (count) => {
  pointId  = 0;
  return Array.from({length: count}, generatePoint);
};
