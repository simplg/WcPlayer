import IconButton from './IconButton';

export default class FullscreenButton extends IconButton {
  constructor() {
    super();
    this.icon = this.fullscreen ? 'minimize' : 'maximize';
  }

  attributeChangedCallback(name: string): void {
    super.attributeChangedCallback(name);
    if (name === 'fullscreen') {
      this.icon = this.fullscreen ? 'minimize' : 'maximize';
    }
  }

  static get observedAttributes(): string[] {
    return ['color', 'fullscreen'];
  }

  get fullscreen(): boolean {
    return this.hasAttribute('fullscreen');
  }

  set fullscreen(fullscreen: boolean) {
    if (fullscreen) this.removeAttribute('fullscreen');
    else this.setAttribute('fullscreen', '');
  }
}

customElements.define('fullscreen-button', FullscreenButton);
