export default class PiPButton extends HTMLButtonElement {
  constructor() {
    super();
    this.innerHTML = this.build();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'pip') {
      this.innerHTML = this.build();
    }
  }

  build(): string {
    if (this.isPiP) {
      return `Ec`;
    }
    return `Pi`;
  }

  static get observedAttributes(): string[] {
    return ['pip'];
  }

  get isPiP(): boolean {
    return this.hasAttribute('pip');
  }
}

customElements.define('pip-button', PiPButton, { extends: 'button' });
