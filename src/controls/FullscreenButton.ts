export default class FullscreenButton extends HTMLButtonElement {
  constructor() {
    super();
    this.innerHTML = this.build();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'fullscreen') {
      this.innerHTML = this.build();
    }
  }

  build(): string {
    if (this.isFullscreen) {
      return `Ec`;
    }
    return `Fs`;
  }

  static get observedAttributes(): string[] {
    return ['fullscreen'];
  }

  get isFullscreen(): boolean {
    return this.hasAttribute('fullscreen');
  }
}

customElements.define('fullscreen-button', FullscreenButton, { extends: 'button' });
