import IconButton from './IconButton';

export default class PiPButton extends IconButton {
  constructor() {
    super();
    this.icon = this.pip ? 'monitor' : 'monitor';
  }

  attributeChangedCallback(name: string): void {
    super.attributeChangedCallback(name);
    if (name === 'pip') {
      this.icon = this.pip ? 'monitor' : 'monitor';
    }
  }

  static get observedAttributes(): string[] {
    return ['color', 'pip'];
  }

  get pip(): boolean {
    return this.hasAttribute('pip');
  }

  set pip(pip: boolean) {
    if (pip) this.removeAttribute('pip');
    else this.setAttribute('pip', '');
  }
}

customElements.define('pip-button', PiPButton);
