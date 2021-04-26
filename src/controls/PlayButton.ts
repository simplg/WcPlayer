import IconButton from './IconButton';

export default class PlayButton extends IconButton {
  constructor() {
    super();
    this.icon = this.paused ? 'play' : 'pause';
  }

  attributeChangedCallback(name: string): void {
    super.attributeChangedCallback(name);
    if (name === 'paused') {
      this.icon = this.paused ? 'play' : 'pause';
    }
  }

  static get observedAttributes(): string[] {
    return ['color', 'paused'];
  }

  get paused(): boolean {
    return this.hasAttribute('paused');
  }

  set paused(paused: boolean) {
    if (paused) this.removeAttribute('paused');
    else this.setAttribute('paused', '');
  }
}

customElements.define('play-button', PlayButton);
