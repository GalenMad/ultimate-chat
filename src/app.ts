import './scss/styles.scss';
import pages from './pages';
import Router from './modules/router';
import AuthController from './modules/controllers/auth';

// TODO: Прикрутить алиасы когда будет вебпак

// TODO: Поправить именование классов по БЭМ
// TODO: Настроить аутлайны (глобально для всех контролов)

// TODO: Попробовать организовать глобальные события, чтобы чистить валидацию,
//        хайдить модалки и т.д. Возможно, стоит хранить его в сторе

// TODO: Рефактор жизненного цикла компонента
// TODO: Глобальная проблема потеря инпутами фокуса при ререндере
// Вариант 1 — не использовать ререндер для элементов с инпутами
// Вариант 2 — при перерендере делать проверку на фокус у вложенного инпута

// TODO: Линтинг
// TODO: TS
pages.forEach(({
  block, path, props = {}, options = {},
}) => Router.use(path, block, props, options));
new AuthController().init();
