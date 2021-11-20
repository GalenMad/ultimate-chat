import Router from '../router';
import { mutations, get } from '../store';
import LoadingModalController from './loading-modal';
import ErrorModalController from './error-modal';
import SuccessModalController from './success-modal';

export default class BaseController {
  router: typeof Router;

  getAuthorizationStatus: () => boolean;

  mutations: {
    setAuthorizationStatus: (status: boolean) => void;
    setUserInfo: (info: UserInfo) => void;
    setUserChats: (chats: ChatItem[]) => void;
    setChatUsers: (id: number, users: UserInfo[]) => void;
    setActiveChat: (id: number | string) => void;
  };

  loadingModal: LoadingModalController;

  errorModal: ErrorModalController;

  successModal: SuccessModalController;

  constructor() {
    this.router = Router;
    this.mutations = mutations;
    this.getAuthorizationStatus = () => get('isAuthorized');
    this.loadingModal = new LoadingModalController();
    this.errorModal = new ErrorModalController();
    this.successModal = new SuccessModalController();
  }

  throwError(response: { data: string, status: string } | RequestResponse) {
    const { data, status } = response;
    // TODO: Кривоватая конструкция из-за требований TS
    const reason = typeof data !== 'string' ? data?.reason : data || 'Не придумал что сюда писать, просто посмотри в консоль';
    this.loadingModal.hide();
    this.errorModal.show({ status, reason });
    throw new Error(`\n status: ${status} \n reason: ${reason}`);
  }
}