import { required } from './validators';

export default [{
  label: 'Выбрать файл',
  id: 'avatar',
  name: 'avatar',
  type: 'file',
  accept: 'images/*',
  validators: [
    required(),
  ],
}];
