import BaseController from './base.controller';
import { LoginAPI, LogoutAPI, UserInfoAPI } from '../api/auth.api';

// TODO: К вопросу ниже, нужны ли эти консты здесь
const loginAPI = new LoginAPI();
const logoutAPI = new LogoutAPI();
const userInfoAPI = new UserInfoAPI();

// TODO: Может тоже сделать как синглтон аля ice factory?
export default class AuthController extends BaseController {

  async init() {
    this.loadingModal.show();
    await this.checkAuthorization();
    this.router.start(this.getAuthorizationStatus);
    this.loadingModal.hide();
  }

  async checkAuthorization() {
    const response = await userInfoAPI.request();
    this.mutations.setAuthorizationStatus(!response.error);
    if (!response.error) {
      this.mutations.setUserInfo(response.data);
    }
  }


  async getUserInfo() {
    const response = await userInfoAPI.request();
    if (response.error) {
      this.mutations.setAuthorizationStatus(false);
      this.router.go('/sign-in');
      this.throwError('userInfoAPI', response);
    }
    this.mutations.setUserInfo(response.data);
  }

  async login(data: Record<string, string | number>) {
    this.loadingModal.show();
    // TODO: Единый контроллер появления модалок вместо вывода ошибок
    const response = await loginAPI.request(data);
    if (response.error) {
      this.throwError('loginAPI', response);
    }

    this.mutations.setAuthorizationStatus(true);
    this.getUserInfo();
    this.router.go('/');
    this.loadingModal.hide();
  }

  async registration(data: Record<string, string | number>) {
    this.loadingModal.show();
    const response = await loginAPI.create(data);
    if (response.error) {
      this.throwError('loginAPI', response);
    }

    this.mutations.setAuthorizationStatus(true);
    this.getUserInfo();
    this.router.go('/');
    this.loadingModal.hide();
  }

  // TODO: Как быть, если юзер почистит куки на страницах с чатами?
  async logout() {
    this.loadingModal.show();
    const response = await logoutAPI.request();
    if (response.error) {
      this.throwError('loginAPI', response);
    }

    this.mutations.setAuthorizationStatus(false);
    this.router.go('/sign-in');
    this.loadingModal.hide();
  }
}
