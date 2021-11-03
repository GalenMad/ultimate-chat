import Block from '../../modules/block';
import compileTemplate from './template.pug';
import './styles.scss';

class Page extends Block {
  constructor(props = {}) {
    super('div', props);
  }

  render() {
    return compileTemplate(this.props);
  }
}

export default (props: {errorCode: string, title: string, message: string, linkText: string, linkAddress: string}) => new Page(props).getContent();