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
    this.shadowRoot.innerHTML = this.build();
  }

  static get observedAttributes(): string[] {
    return ['volume'];
  }

  attributeChangedCallback(name: string): void {
    if (name === 'volume') {
      this.shadowRoot.innerHTML = this.build();
    }
  }

  reload(): void {
    this.shadowRoot.innerHTML = this.build();
    this.shadowRoot.querySelector('#volumeSlider').addEventListener('change', () => {
      this.dispatchEvent(
        new CustomEvent('volumechange', {
          detail: {
            volume: parseInt((this.querySelector('#volumeSlider') as HTMLInputElement).value),
          },
        }),
      );
    });
  }

  build(): string {
    return `<style>
        .volume-slider {
          -webkit-appearance: none;
          ${
            !this.options.vertical
              ? `width: 100%;`
              : `width: 100px;
          margin-top: 82px;
          transform-origin: center left;`
          }
          height: 3px;
          border-radius: 1px;
          background: ${this.options.bgColor};
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
        <input type="range" min="0" max="100" value="${this.volume}" class="volume-slider" id="volumeSlider" />
      </div>`;
  }

  get volume(): number {
    return this.hasAttribute('volume') ? parseInt(this.getAttribute('volume')) : 100;
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
