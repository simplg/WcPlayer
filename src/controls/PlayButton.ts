export default class PlayButton extends HTMLButtonElement {
  constructor() {
    super();
    this.innerHTML = this.build();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'paused') {
      this.innerHTML = this.build();
    }
  }

  build(): string {
    if (this.paused) {
      return `Pa`;
    }
    return `Pl`;
  }

  static get observedAttributes(): string[] {
    return ['paused'];
  }

  get paused(): boolean {
    return this.hasAttribute('paused');
  }
}

customElements.define('play-button', PlayButton, { extends: 'button' });
