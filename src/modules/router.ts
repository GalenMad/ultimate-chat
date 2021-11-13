import Route from './route';
import Store from './store';

enum ADDRESSES {
  ERROR = '/error-404',
  AUTH = '/sign-in',
  MAIN = '/'
}
const store = new Store();
const ROOT = '#app';
let routerInstance: Router | null = null;

export default class Router {
  routes: any[];
  history: History;
  _currentRoute: any;
  _rootQuery: string;

  constructor(rootQuery: string = ROOT) {

    if (routerInstance) {
      return routerInstance;
    }

    this.routes = [];
    this.history = window.history;
    this._currentRoute = null;
    this._rootQuery = rootQuery;

    routerInstance = this;
  }

  use(pathname: string, block: unknown, props: {}, options: {}) {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery, ...props }, options);
    this.routes.push(route);
    return this;
  }

  start() {
    const root = document.querySelector(this._rootQuery);

    if (!root) {
      throw new Error('Неверный селектор root-элемента')
    }

    root.innerHTML = '';

    root.addEventListener('click', (evt) => {
      const link = evt.path.find((elem: HTMLElement) => elem.tagName === 'A' && elem.href)
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

    // TODO: Узнать что уместнее — редирект или рендер с сохранением адреса
    if (!route) {
      this.go(ADDRESSES.ERROR);
    } else if (route.isPrivate && !store.isAuthorized) {
      this.go(ADDRESSES.AUTH);
    } else if (route.isNotForAuthorized && store.isAuthorized) {
      this.go(ADDRESSES.MAIN);
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
    return this.routes.find(route => route.match(pathname));
  }
}
