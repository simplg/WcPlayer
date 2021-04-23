export default class SettingsButton extends HTMLButtonElement {
  constructor() {
    super();
    this.innerHTML = this.build();
  }

  build(): string {
    return `St`;
  }
}

customElements.define('settings-button', SettingsButton, { extends: 'button' });
