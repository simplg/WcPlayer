import { AbstractPlayer, PlayerConstructor } from './PlayerInterface';
import { WcControls } from './Controls';
import { StoreInterface } from './StoreInterface';
import { WcPlayerEventMap } from './events';

type WcStore = {
  store: StoreInterface;
  isGlobal: boolean;
};

export default class WcPlayer extends HTMLElement {
  private _platform: typeof PlayerConstructor;
  static platforms: Map<string, typeof PlayerConstructor> = new Map();
  public currentPlayer: PlayerConstructor;
  private controls = new WcControls();
  static store: StoreInterface;
  constructor(type = '', source = '') {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.build();
    this.attachControllerEvents();
    this.shadowRoot.querySelector('.wcplayer').append(this.controls);
    const slot = this.shadowRoot.querySelector('slot.platform');
    slot.classList.add('hide');
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
    console.log(WcPlayer.platforms);
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
      .hide {
        display: none;
      }
    </style>
    <div class="wcplayer">
      <slot class="platform"></slot>
    </div>`;
  }

  static get observedAttributes(): string[] {
    return ['source', 'type', 'muted', 'volume'];
  }

  get platform(): string {
    return this._platform.platform;
  }
  set platform(platform: string) {
    this._platform = WcPlayer.platforms.get(platform);
    if (this.currentPlayer !== undefined) this.shadowRoot.querySelector('.wcplayer').removeChild(this.currentPlayer);
    this.currentPlayer = new this._platform(this);
    this.currentPlayer.classList.add('player');
    this.attachPlayerEvents();
    this.shadowRoot.querySelector('.wcplayer').prepend(this.currentPlayer);
    this.controls.reload();
  }

  get source(): string {
    return this.hasAttribute('source') ? this.getAttribute('source') : '';
  }

  set source(src: string) {
    if (src !== this.source) {
      this.setAttribute('source', src);
      this.currentPlayer.source = src;
    }
  }

  get type(): string {
    const type = this.hasAttribute('type') ? this.getAttribute('type') : '';
    return type;
  }

  set type(type: string) {
    if (type !== this.type && WcPlayer.platforms.has(type)) {
      this.setAttribute('type', type);
      this.platform = type;
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
        const { volume, muted } = this.currentPlayer;
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
        this.controls.elements.volumeElement.setAttribute('volume', this.store.get(this, 'volume').toString());
        this.currentPlayer.volume = this.store.get(this, 'volume');
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
            this.currentPlayer.muted = true;
            return;
          }
          if (this.currentPlayer.muted) this.currentPlayer.muted = false;
          this.currentPlayer.volume = volume;
          this.store.set(this, 'volume', volume);
        }
      });
      this.controls.addEventListener('wcmuted', (e) => {
        if (this.currentPlayer !== undefined) {
          const { muted } = e.detail;
          this.currentPlayer.muted = muted;
          this.store.set(this, 'muted', muted);
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
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof WcPlayerEventMap>(
    type: K,
    listener: (ev: CustomEvent<WcPlayerEventMap[K]>) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
  }

  emit<K extends keyof WcPlayerEventMap>(type: K, ev: WcPlayerEventMap[K]): void {
    super.dispatchEvent(
      new CustomEvent<WcPlayerEventMap[K]>(type, { detail: ev }),
    );
  }
}
