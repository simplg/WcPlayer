import IconButton from './IconButton';

export default class VolumeButton extends IconButton {
  constructor() {
    super();
    this.icon = this.mute ? 'volume-x' : 'volume-2';
  }

  attributeChangedCallback(name: string): void {
    super.attributeChangedCallback(name);
    if (name === 'mute') {
      this.icon = this.mute ? 'volume-x' : 'volume-2';
    }
  }

  static get observedAttributes(): string[] {
    return ['color', 'mute'];
  }

  get mute(): boolean {
    return this.hasAttribute('mute');
  }

  set mute(muted: boolean) {
    if (muted) this.removeAttribute('mute');
    else this.setAttribute('mute', '');
  }
}

customElements.define('volume-button', VolumeButton);
