import { AbstractPlayer, PlayerConstructor } from './PlayerInterface';
import { WcControls } from './Controls';

export default class WcPlayer extends HTMLElement {
  private _platform: typeof PlayerConstructor;
  static platforms: Map<string, typeof PlayerConstructor> = new Map();
  public currentPlayer: PlayerConstructor;
  private controls = new WcControls();
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
      console.log('lol');
      console.log(WcPlayer.platforms);
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

  static define(): void {
    customElements.define('wc-player', WcPlayer);
  }

  build(): string {
    return `
    <style>
      .wcplayer {
        width: 100%;
        height: 100%;
        background: black;
      }
      .hide {
        display: none;
      }
    </style>
    <div class="wcplayer">
      <div class="player">
        <slot class="platform"></slot>
      </div>
    </div>`;
  }

  static get observedAttributes(): string[] {
    return ['source', 'type'];
  }

  get platform(): string {
    return this._platform.platform;
  }
  set platform(platform: string) {
    this._platform = WcPlayer.platforms.get(platform);
    if (this.currentPlayer !== undefined) this.shadowRoot.querySelector('.player').removeChild(this.currentPlayer);
    this.currentPlayer = new this._platform(this);
    this.attachPlayerEvents();
    this.shadowRoot.querySelector('.player').appendChild(this.currentPlayer);
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
      this.currentPlayer.addEventListener('durationchange', (e) => {
        this.controls.controls.timerElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.controls.timerElement.setAttribute('time', this.currentPlayer.currentTime.toString());
        this.controls.controls.seekElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.controls.seekElement.setAttribute('time', this.currentPlayer.currentTime.toString());
      });
      this.currentPlayer.addEventListener('timeupdate', (e) => {
        this.controls.controls.timerElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.controls.timerElement.setAttribute('time', this.currentPlayer.currentTime.toString());
        this.controls.controls.seekElement.setAttribute('duration', this.currentPlayer.duration.toString());
        this.controls.controls.seekElement.setAttribute('time', this.currentPlayer.currentTime.toString());
      });
    }
  }
  private attachControllerEvents(): void {
    if (this.controls !== undefined) {
      this.controls.addEventListener('toggle_play', () => {
        console.log('play_pause_received');
        if (this.currentPlayer !== undefined) {
          if (this.currentPlayer.playing) this.currentPlayer.pause();
          else this.currentPlayer.play();
        }
      });
    }
  }
}
