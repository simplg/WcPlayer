export default class VolumeButton extends HTMLButtonElement {
  constructor() {
    super();
    this.innerHTML = this.build();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'mute') {
      this.innerHTML = this.build();
    }
  }

  build(): string {
    if (this.isMute) {
      return `Ec`;
    }
    return `Fs`;
  }

  static get observedAttributes(): string[] {
    return ['mute'];
  }

  get isMute(): boolean {
    return this.hasAttribute('mute');
  }
}

customElements.define('volume-button', VolumeButton, { extends: 'button' });
