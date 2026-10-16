import type enUS from '../en-US';

// Typed against en-US so a missing or extra key fails the type check
const uk: typeof enUS = {
  app: {
    name: 'Погода',
  },
  common: {
    retry: 'Спробувати знову',
    refresh: 'Оновити',
    cancel: 'Скасувати',
    more: 'Більше',
  },
  theme: {
    system: 'Системна тема',
    light: 'Світла тема',
    dark: 'Темна тема',
  },
  language: {
    switch: 'Змінити мову',
    short: 'UA',
  },
  search: {
    placeholder: 'Пошук міста',
    useLocation: 'Моя геолокація',
    noResults: 'Міст за запитом «{query}» не знайдено',
    noResultsHint: 'Перевірте написання або спробуйте іншу назву.',
  },
  location: {
    use: 'Моя геолокація',
    current: 'Поточне місцезнаходження',
    fallback: 'Показано {city}. Знайдіть місто або увімкніть доступ до геолокації.',
  },
  home: {
    updatedAt: 'Оновлено о {time}',
  },
  weather: {
    feelsLike: 'Відчувається',
    humidity: 'Вологість',
    wind: 'Вітер',
    pressure: 'Тиск',
    visibility: 'Видимість',
    cloudiness: 'Хмарність',
    high: 'Макс.',
    low: 'Мін.',
    today: 'Сьогодні',
    now: 'Зараз',
    hourly: 'Погодинний прогноз',
    daily: 'Прогноз на 5 днів',
  },
  units: {
    kmh: 'км/год',
    hpa: 'гПа',
    km: 'км',
    m: 'м',
  },
  errors: {
    not_found: 'Не вдалося знайти це місце.',
    network: 'Немає з’єднання. Перевірте інтернет і спробуйте ще раз.',
    timeout: 'Запит триває надто довго. Спробуйте ще раз.',
    upstream_error: 'Сервіс погоди зараз недоступний.',
    upstream_busy: 'Сервіс погоди перевантажений. Спробуйте за мить.',
    too_many_requests: 'Забагато запитів.',
    invalid_request: 'Із запитом щось не так.',
    internal: 'Щось пішло не так на нашому боці.',
    unknown: 'Щось пішло не так. Спробуйте ще раз.',
    geo_denied: 'Доступ до геолокації вимкнено.',
    geo_unavailable: 'Не вдалося визначити ваше місцезнаходження.',
    geo_timeout: 'Визначення місцезнаходження триває надто довго.',
    geo_unsupported: 'Геолокація не підтримується на цьому пристрої.',
  },
  favorites: {
    title: 'Міста',
    add: 'Додати до обраного',
    remove: 'Видалити з обраного',
    addCity: 'Додати місто',
    added: '{city} додано до обраного',
    removed: '{city} видалено',
    undo: 'Скасувати',
    limit: 'Можна зберегти до {max} міст',
    empty: 'Збережених міст поки немає',
    emptyHint: 'Натисніть на серце біля міста, щоб воно з’явилося тут.',
    dot: 'Місто {n} з {total}',
  },
};

export default uk;
