export interface VolumeOptions {
  bgColor: string;
  thumbColor: string;
  filledColor: string;
  vertical: boolean;
  position: {
    top: string;
    left: string;
    bottom: string;
    right: string;
  };
}

export class VolumeElement extends HTMLElement {
  _options: VolumeOptions;
  private shouldEmit = true;
  constructor(opt?: VolumeOptions) {
    super();
    const defaultStyle: VolumeOptions = {
      bgColor: '#d3d3d3',
      thumbColor: '#ff426b',
      filledColor: '#ff426b',
      vertical: false,
      position: { top: '', bottom: '', left: '', right: '' },
    };
    this._options = Object.assign(defaultStyle, opt);
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback(): void {
    this.reload();
  }

  static get observedAttributes(): string[] {
    return ['volume'];
  }

  attributeChangedCallback(name: string): void {
    if (name === 'volume') {
      this.shouldEmit = false;
      this.style.removeProperty('--_perc');
      (this.shadowRoot.querySelector('.volume-slider') as HTMLInputElement).value = this.volume.toString();
      requestAnimationFrame(() => {
        this.style.setProperty('--_perc', this.volume.toString());
      });
      this.shouldEmit = true;
    }
  }

  reload(): void {
    this.shadowRoot.innerHTML = this.build();
    this.shadowRoot.querySelector('.volume-slider').addEventListener('input', () => {
      if (this.shouldEmit) this.onChangeListener();
    });
  }

  private onChangeListener(): void {
    const volume = parseFloat((this.shadowRoot.querySelector('.volume-slider') as HTMLInputElement).value);
    requestAnimationFrame(() => {
      this.style.setProperty('--_perc', volume.toString());
    });
    this.dispatchEvent(
      new CustomEvent('volumechange', {
        detail: {
          volume,
        },
      }),
    );
  }

  build(): string {
    return `<style>
        :host {
          --_perc: ${this.volume};
        }
        .volume-slider {
          -webkit-appearance: none;
          ${
            !this.options.vertical
              ? `width: 100%;`
              : `width: 100px;
          margin-top: 82px;
          transform-origin: center left;`
          }
          
          background: linear-gradient(to right,
            var(--slider-bg-active, ${this.options.filledColor}) 0%,
            var(--slider-bg-active, ${this.options.filledColor}) calc(var(--_perc) * 100%),
            var(--slider-bg, ${this.options.bgColor}) calc(var(--_perc) * 100%),
            var(--slider-bg, ${this.options.bgColor} 100%));
          height: 3px;
          border-radius: 1px;
          outline: none;
          opacity: 0.7;
          -webkit-transition: 0.2s;
          transition: opacity 0.2s;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${this.options.thumbColor};
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${this.options.thumbColor};
          cursor: pointer;
        }

        .volume-slider::-moz-range-progress {
          background-color: ${this.options.filledColor};
        }
      </style>
      <div class="volume-container">
        <input type="range" min="0" max="1" step="0.05" value="${this.volume}" class="volume-slider" />
      </div>`;
  }

  get volume(): number {
    return this.hasAttribute('volume') ? parseFloat(this.getAttribute('volume')) : 1;
  }
  get vertical(): boolean {
    return this.hasAttribute('vertical');
  }

  get options(): VolumeOptions {
    return this._options;
  }

  set options(opt: VolumeOptions) {
    this._options = opt;
  }
}

customElements.define('volume-element', VolumeElement);
