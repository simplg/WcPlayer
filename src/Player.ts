import { AbstractPlayer, PlayerConstructor } from './PlayerInterface';
import { WcControls } from './Controls';
import { StoreInterface } from './StoreInterface';
import { WcPlayerEventMap } from './events';
import { FxManager, HideControlFx } from './FxManager';

export type EffectOptions = {
  hideControls: boolean;
  hideVolume: boolean;
};

export type WcTheme = {
  controls: {
    color: string;
    background: string;
  };
};

enum WcPlayerFx {
  HIDE_CONTROLS = 'hide_controls',
}

export default class WcPlayer extends HTMLElement {
  static platforms: Map<string, typeof PlayerConstructor> = new Map();
  static store: StoreInterface;
  public currentPlayer: PlayerConstructor;
  private _platform: typeof PlayerConstructor;
  private _controls = new WcControls();
  private defaultFx: EffectOptions = { hideControls: true, hideVolume: true };
  private fxManager = new FxManager();
  private defaultTheme: WcTheme = {
    controls: {
      color: 'white',
      background: 'black',
    },
  };
  constructor(type = '', source = '', theme: Partial<WcTheme> = {}) {
    super();
    this.muted = this.hasAttribute('muted') || this.store.get(this, 'muted');
    this.volume = this.hasAttribute('volume')
      ? parseFloat(this.getAttribute('volume'))
      : this.store.get(this, 'volume');
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.build();
    this.attachControllerEvents();
    this.shadowRoot.querySelector('.wcplayer').append(this.controls);
    const slot = this.shadowRoot.querySelector('slot.platform') as HTMLElement;
    slot.style.display = 'none';
    this.refreshFx();
    this.theme = Object.assign(this.defaultTheme, this.theme);
    if (type !== undefined && type !== '') {
      this.type = type;
    }
    if (source !== undefined && source !== '') {
      this.source = source;
    } else if (this.slotChildElement !== undefined) {
      const platform = Array.from(WcPlayer.platforms.values()).find((plt) => plt.matchElement(this.slotChildElement));
      if (platform !== undefined) {
        this.platform = platform.platform;
      }
    }
  }

  static use(pltClass: typeof PlayerConstructor): void {
    if (pltClass.prototype instanceof AbstractPlayer) {
      if (!WcPlayer.platforms.has(pltClass.platform)) WcPlayer.platforms.set(pltClass.platform, pltClass);
    }
  }

  static setStore(store: StoreInterface): void {
    WcPlayer.store = store;
  }

  static define(): void {
    customElements.define('wc-player', WcPlayer);
  }

  get store(): StoreInterface {
    return WcPlayer.store;
  }

  build(): string {
    return `
    <style>
      .wcplayer {
        width: 100%;
        height: 100%;
        background: black;
        overflow: hidden;
      }
      .player {
        width: 100%;
        height: 100%;
      }
      wc-controls {
        opacity: 1;
        transition: opacity .3s, visibility .3s;
        position: relative;
        z-index: 2;
        height: 45px;
        width: 100%;
        top: -45px;
        background: ${this.theme.controls.background};
        color: ${this.theme.controls.color};
        display:block;
      }
      .hide {
        visibility: hidden;
        opacity: 0;
      }
    </style>
    <div class="wcplayer">
      <slot class="platform"></slot>
    </div>`;
  }

  static get observedAttributes(): string[] {
    return ['source', 'type', 'muted', 'volume', 'fx-options', 'nocontrols'];
  }

  get platform(): string {
    return this._platform.platform;
  }
  set platform(platform: string) {
    this._platform = WcPlayer.platforms.get(platform);
    if (this.currentPlayer !== undefined) this.shadowRoot.querySelector('.wcplayer').removeChild(this.currentPlayer);
    this.currentPlayer = new this._platform(this);
    this.currentPlayer.classList.add('player');
    this.shadowRoot.querySelector('.wcplayer').prepend(this.currentPlayer);
    this.controls.reload();
    this.attachPlayerEvents();
  }

  get source(): string {
    return this.hasAttribute('source') ? this.getAttribute('source') : '';
  }

  set source(src: string) {
    if (src !== this.source) {
      this.setAttribute('source', src);
    }
  }

  get type(): string {
    const type = this.hasAttribute('type') ? this.getAttribute('type') : '';
    return type;
  }

  set type(type: string) {
    if (type !== this.type && WcPlayer.platforms.has(type)) {
      this.setAttribute('type', type);
    }
  }

  get volume(): number {
    const volume = parseFloat(this.getAttribute('volume'));
    return volume;
  }

  set volume(volume: number) {
    volume = volume < 1 ? volume : 1;
    this.store.set(this, 'volume', volume);
    this.setAttribute('volume', volume.toString());
  }

  get fxOptions(): EffectOptions {
    const fx = JSON.parse(this.getAttribute('fx-options')) as EffectOptions;
    return Object.assign(this.defaultFx, fx);
  }

  set fxOptions(fxOptions: EffectOptions) {
    this.setAttribute('fx-options', JSON.stringify(fxOptions));
  }

  get theme(): WcTheme {
    const theme = JSON.parse(this.getAttribute('theme')) as EffectOptions;
    return Object.assign(this.defaultTheme, theme);
  }

  set theme(theme: WcTheme) {
    this.setAttribute('theme', JSON.stringify(theme));
  }

  get nocontrols(): boolean {
    return this.hasAttribute('nocontrols');
  }

  set nocontrols(hide: boolean) {
    if (!hide) this.removeAttribute('nocontrols');
    else this.setAttribute('nocontrols', '');
  }

  get muted(): boolean {
    return this.hasAttribute('muted');
  }

  set muted(mute: boolean) {
    this.store.set(this, 'muted', mute);
    if (!mute) this.removeAttribute('muted');
    else this.setAttribute('muted', '');
  }

  get controls(): WcControls {
    return this._controls;
  }

  attributeChangedCallback(name: string, newValue: string): void {
    switch (name) {
      case 'type':
        this.platform = newValue;
        break;
      case 'source':
        this.currentPlayer.source = newValue;
        break;
      case 'muted':
        this.setMute(this.muted);
        break;
      case 'volume':
        this.setVolume(this.volume);
        break;
      case 'nocontrols':
        this.setNoControls(this.nocontrols);
        break;
      case 'fx-options':
        this.refreshFx();
        break;
      default:
        break;
    }
  }

  get slotChildElement(): Element {
    return (this.shadowRoot.querySelector('slot.platform') as HTMLSlotElement).assignedElements()[0];
  }

  private attachPlayerEvents(): void {
    if (this.currentPlayer !== undefined) {
      this.currentPlayer.addEventListener('durationchange', () => {
        this.emit('beforedurationchange', { wcplayer: this });
        this.controls.elements.timerElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.elements.timerElement.setAttribute('time', this.currentPlayer.currentTime.toString());
        this.controls.elements.seekElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.elements.seekElement.setAttribute('time', this.currentPlayer.currentTime.toString());
        this.emit('afterdurationchange', { wcplayer: this });
      });
      this.currentPlayer.addEventListener('timeupdate', () => {
        this.emit('beforetimeupdate', { wcplayer: this });
        this.controls.elements.timerElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.elements.timerElement.setAttribute('time', this.currentPlayer.currentTime.toString());
        this.controls.elements.seekElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.elements.seekElement.setAttribute('time', this.currentPlayer.currentTime.toString());
        this.emit('aftertimeupdate', { wcplayer: this });
      });
      this.currentPlayer.addEventListener('volumechange', () => {
        this.emit('beforevolumechange', { wcplayer: this });
        const { volume, muted } = this;
        const isVolumeButtonMuted = this.controls.elements.volumeButton.hasAttribute('mute');
        if (muted && !isVolumeButtonMuted) {
          this.controls.elements.volumeButton.setAttribute('mute', '');
          this.controls.elements.volumeElement.setAttribute('volume', '0');
        } else if (!muted && isVolumeButtonMuted) {
          this.controls.elements.volumeButton.removeAttribute('mute');
          this.controls.elements.volumeElement.setAttribute('volume', volume.toString());
        }
        this.emit('aftervolumechange', { wcplayer: this });
      });
      this.currentPlayer.addEventListener('playing', () => {
        this.emit('beforeplaying', { wcplayer: this });
        this.controls.elements.playPauseButton.removeAttribute('paused');
        this.emit('afterplaying', { wcplayer: this });
      });
      this.currentPlayer.addEventListener('pause', () => {
        this.emit('beforepausing', { wcplayer: this });
        this.controls.elements.playPauseButton.setAttribute('paused', '');
        this.emit('afterpausing', { wcplayer: this });
      });
      this.currentPlayer.addEventListener('ready', () => {
        if (this.currentPlayer.playing) this.controls.elements.playPauseButton.removeAttribute('paused');
        else this.controls.elements.playPauseButton.setAttribute('paused', '');
        this.controls.elements.volumeElement.setAttribute('volume', this.volume.toString());
        this.currentPlayer.volume = this.volume;
        this.currentPlayer.muted = this.muted;
        this.emit('ready', { wcplayer: this });
      });
    }
  }
  private attachControllerEvents(): void {
    if (this.controls !== undefined) {
      this.controls.addEventListener('wctoggleplay', () => {
        if (this.currentPlayer !== undefined) {
          if (this.currentPlayer.playing) this.currentPlayer.pause();
          else this.currentPlayer.play();
        }
      });
      this.controls.addEventListener('wcseekchange', (e) => {
        if (this.currentPlayer !== undefined) {
          const { time } = e.detail;
          this.currentPlayer.currentTime = time;
        }
      });
      this.controls.addEventListener('wcvolumechange', (e) => {
        if (this.currentPlayer !== undefined) {
          const { volume } = e.detail;
          if (volume == 0) {
            this.muted = true;
            return;
          }
          if (this.muted) this.muted = false;
          this.volume = volume;
        }
      });
      this.controls.addEventListener('wcmuted', (e) => {
        if (this.currentPlayer !== undefined) {
          const { muted } = e.detail;
          this.muted = muted;
        }
      });
      this.controls.addEventListener('wcfullscreen', () => {
        if (document.fullscreenElement !== this) {
          this.requestFullscreen({ navigationUI: 'hide' });
          this.controls.elements.fullscreenButton.setAttribute('fullscreen', '');
        } else {
          document.exitFullscreen();
          this.controls.elements.fullscreenButton.removeAttribute('fullscreen');
        }
      });
    }
  }

  addEventListener<K extends keyof WcPlayerEventMap>(
    type: K,
    listener: (ev: CustomEvent<WcPlayerEventMap[K]>) => void,
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

  removeEventListener<K extends keyof WcPlayerEventMap>(
    type: K,
    listener: (ev: CustomEvent<WcPlayerEventMap[K]>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(type: any, listener: any, options?: any): void {
    super.removeEventListener(type, listener, options);
  }

  emit<K extends keyof WcPlayerEventMap>(type: K, ev: WcPlayerEventMap[K]): void {
    super.dispatchEvent(
      new CustomEvent<WcPlayerEventMap[K]>(type, { detail: ev }),
    );
  }

  private setMute(muted: boolean): void {
    if (this.currentPlayer !== undefined) {
      this.currentPlayer.muted = muted;
    }
  }
  private setVolume(volume: number): void {
    if (this.currentPlayer !== undefined) {
      this.currentPlayer.volume = volume;
    }
  }
  private setNoControls(nocontrols: boolean): void {
    if (this.controls !== undefined) {
      if (nocontrols) this.controls.style.display = 'none';
      else this.controls.style.display = '';
    }
  }
  private refreshFx(): void {
    const { hideVolume, hideControls } = this.fxOptions;
    this.controls.options = { hideVolume };
    console.log(this.controls);
    if (hideControls && !this.fxManager.has(WcPlayerFx.HIDE_CONTROLS)) {
      this.fxManager.add(WcPlayerFx.HIDE_CONTROLS, new HideControlFx(this));
    } else if (!hideControls && this.fxManager.has(WcPlayerFx.HIDE_CONTROLS)) {
      this.fxManager.remove(WcPlayerFx.HIDE_CONTROLS);
    }
  }
}
