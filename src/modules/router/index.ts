/* eslint-disable no-restricted-globals */
import Route from './route';

enum ADDRESSES {
  ERROR = '/error-404',
  AUTH = '/sign-in',
  MAIN = '/',
}

const ROOT = '#app';

class Router {
  routes: any[];

  history: History;

  _currentRoute: any;

  _rootQuery: string;

  getAuthorizationStatus: () => boolean;

  constructor(rootQuery: string = ROOT) {
    this.routes = [];
    this.history = window.history;
    this._currentRoute = null;
    this.getAuthorizationStatus = () => false;
    this._rootQuery = rootQuery;
  }

  use(pathname: string, block: unknown, props: {}, options: {}) {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery, ...props }, options);
    this.routes.push(route);
    return this;
  }

  replaceRoute(pathname: string) {
    history.replaceState({}, '', pathname);
    this._currentRoute = this.getRoute(pathname);
    this._currentRoute?.render();
  }

  // TODO: Костыль с передачей метода уточнения статуса авторизации
  async start(authorizationStatusGetter?: () => boolean) {
    const root = document.querySelector(this._rootQuery);
    this.getAuthorizationStatus = authorizationStatusGetter || this.getAuthorizationStatus;

    if (!root) {
      throw new Error('Неверный селектор root-элемента');
    }

    root.innerHTML = '';

    root.addEventListener('click', (evt) => {
      const link = evt.path.find((elem: HTMLElement) => elem.tagName === 'A' && elem.href);
      if (link) {
        const pathname = link.getAttribute('href');
        this.go(pathname);
        evt.preventDefault();
      }
    });

    window.addEventListener('popstate', (evt) => {
      if (evt.currentTarget) {
        this._onRoute(evt.currentTarget.location.pathname);
      } else {
        throw new Error('Не обнаружен evt.currentTarget');
      }
    });

    this._onRoute(window.location.pathname);
    return this;
  }

  _onRoute(pathname: string) {
    const route = this.getRoute(pathname);

    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }

    if (this._currentRoute === route) {
      return;
    }

    const isAuthorized = this.getAuthorizationStatus();

    // TODO: Узнать что уместнее — редирект или рендер с сохранением адреса
    if (!route) {
      this.replaceRoute(ADDRESSES.ERROR);
    } else if (route.isPrivate && !isAuthorized) {
      this.replaceRoute(ADDRESSES.AUTH);
    } else if (route.isNotForAuthorized && isAuthorized) {
      this.replaceRoute(ADDRESSES.MAIN);
    } else {
      this._currentRoute = route;
      route.render();
    }
  }

  go(pathname: string) {
    this.history.pushState({ a: 2 }, '', pathname);
    this._onRoute(pathname);
  }

  back() {
    this.history.back();
  }

  forward() {
    this.history.forward();
  }

  getRoute(pathname: string) {
    return this.routes.find((route) => route.match(pathname));
  }
}

export default new Router();