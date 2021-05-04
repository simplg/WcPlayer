import { ControlsEventMap, SeekChangeEvent, VolumeEvent } from './events';
import './controls/PlayButton';
import './controls/VolumeElement';
import './controls/TimerElement';
import './controls/SeekElement';
import './controls/SettingsButton';
import './controls/FullscreenButton';
import './controls/PiPButton';
import './controls/VolumeButton';
import './controls/Panel';
import { FxManager, WidthZeroFx } from './FxManager';

export enum ControlFx {
  HIDE_VOLUME = 'hide_volume',
}

export interface ControlElements {
  playPauseButton: HTMLElement;
  volumeButton: HTMLButtonElement;
  volumeElement: HTMLElement;
  timerElement: HTMLElement;
  seekElement: HTMLElement;
  settingsButton: HTMLElement;
  fullscreenButton: HTMLElement;
  pipButton: HTMLElement;
}

export interface PanelElements {
  settingsPanel: HTMLElement;
}

export type WcControlsOptions = {
  hideVolume: boolean;
};

export class WcControls extends HTMLElement {
  private _elements: ControlElements;
  private _panels: PanelElements;
  private fxManager = new FxManager();
  private defaultOptions: WcControlsOptions = { hideVolume: true };
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.reload();
  }

  get elements(): ControlElements {
    return this._elements;
  }

  get panels(): PanelElements {
    return this._panels;
  }

  get color(): string {
    if (this.hasAttribute('color')) return this.getAttribute('color');
    return 'white';
  }

  set color(color: string) {
    this.setAttribute('color', color);
  }

  get options(): WcControlsOptions {
    const options = JSON.parse(this.getAttribute('options')) as WcControlsOptions;
    return Object.assign(this.defaultOptions, options);
  }

  set options(opt: WcControlsOptions) {
    this.setAttribute('options', JSON.stringify(opt));
  }

  static get observedAttributes(): string[] {
    return ['color', 'options'];
  }

  attributeChangedCallback(name: string): void {
    if (name === 'color') {
      Object.keys(this.elements).forEach((key: keyof ControlElements) => {
        this.elements[key].setAttribute('color', this.color);
      });
    }
    if (name == 'options') {
      if (this.options.hideVolume) this.elements.volumeElement.classList.add('hide');
      else this.elements.volumeElement.classList.remove('hide');
    }
  }

  reload(): void {
    this.shadowRoot.innerHTML = this.build();
    this._elements = {
      playPauseButton: this.shadowRoot.querySelector('play-button'),
      volumeButton: this.shadowRoot.querySelector('volume-button'),
      volumeElement: this.shadowRoot.querySelector('volume-element'),
      timerElement: this.shadowRoot.querySelector('timer-element'),
      seekElement: this.shadowRoot.querySelector('seek-element'),
      settingsButton: this.shadowRoot.querySelector('settings-button'),
      fullscreenButton: this.shadowRoot.querySelector('fullscreen-button'),
      pipButton: this.shadowRoot.querySelector('pip-button'),
    };
    this._panels = {
      settingsPanel: this.shadowRoot.querySelector('settings-panel'),
    };
    this.attachEvents();
    this.setFx();
  }
  attachEvents(): void {
    this.elements.playPauseButton.addEventListener('click', () => {
      this.emit('wctoggleplay', {});
    });
    this.elements.volumeButton.addEventListener('click', () => {
      this.emit('wcmuted', {
        muted: !this.elements.volumeButton.hasAttribute('mute'),
      });
    });
    this.elements.seekElement.addEventListener('seekchange', (e: CustomEvent<SeekChangeEvent>) => {
      const { time } = e.detail;
      this.emit('wcseekchange', { time });
    });
    this.elements.volumeElement.addEventListener('volumechange', (e: CustomEvent<VolumeEvent>) => {
      const { volume } = e.detail;
      this.emit('wcvolumechange', { volume });
    });
    this.elements.fullscreenButton.addEventListener('click', () => {
      this.emit('wcfullscreen', {});
    });
  }

  build(): string {
    return `<style>
        .control-list {
          display: flex;
          flex-direction: row;
          overflow: hidden;
          height: 38px;
          align-items: center;
          justify-content: space-between;
        }
        .control-left, .control-right, .volume-control {
          display: flex;
          flex-direction: row;
          align-items: center;
          height: 100%;
        }
        volume-element {
          width: 80px;
          transition: width .3s, visibility .3s;
        }
        .hide {
          visibility: hidden;
          width: 0;
        }
        .volume-control {
          margin-right: 5px;
        }
      </style>
      <div class="controls">
        <seek-element class="seek-element"></seek-element>
        <div class="control-list">
          <div class="control-right">
            <play-button class="play-button" color="${this.color}"></play-button>
            <div class="volume-control">
              <volume-button class="volume-button" color="${this.color}"></volume-button>
              <volume-element class="volume-element${this.options.hideVolume ? ' hide' : ''}"></volume-element>
            </div>
            <timer-element class="timer-element"></timer-element>
          </div>
          <div class="control-left">
            <settings-button class="settings-button" color="${this.color}"></settings-button>
            <fullscreen-button class="fullscreen-button" color="${this.color}"></fullscreen-button>
            <pip-button class="pip-button" color="${this.color}"></pip-button>
          </div>
        </div>
      </div>
      <wc-panel class="hide"></wc-panel>
    `;
  }
  addEventListener<K extends keyof ControlsEventMap>(
    type: K,
    listener: (this: WcControls, ev: CustomEvent<ControlsEventMap[K]>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: any, listener: any, options?: any): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof ControlsEventMap>(
    type: K,
    listener: (this: WcControls, ev: CustomEvent<ControlsEventMap[K]>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(type: any, listener: any, options?: any): void {
    super.removeEventListener(type, listener, options);
  }

  emit<K extends keyof ControlsEventMap>(type: K, ev: ControlsEventMap[K]): void {
    super.dispatchEvent(
      new CustomEvent<ControlsEventMap[K]>(type, { detail: ev }),
    );
  }

  setFx(): void {
    const { hideVolume } = this.options;
    if (this.fxManager.has(ControlFx.HIDE_VOLUME)) this.fxManager.remove(ControlFx.HIDE_VOLUME);
    if (hideVolume) {
      this.fxManager.add(
        ControlFx.HIDE_VOLUME,
        new WidthZeroFx(this.elements.volumeElement, this.shadowRoot.querySelector('.volume-control')),
      );
    }
  }
}

customElements.define('wc-controls', WcControls);
