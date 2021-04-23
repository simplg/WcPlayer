export interface PanelPosition {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
}

export interface PanelOptions {
  background: string;
  height?: number;
  width?: number;
}

export class Panel extends HTMLElement {
  private _options: PanelOptions;
  constructor(opt?: PanelOptions) {
    super();
    const defaultStyle: PanelOptions = { background: 'rgba(33, 33, 33, .7)' };
    this._options = Object.assign(defaultStyle, opt);
    this.attachShadow({ mode: 'open' });
    this.reload();
  }

  reload(): void {
    this.shadowRoot.innerHTML = this.build();
  }

  build(): string {
    return `<style>
        .panel {
          position: relative;
          ${this.position.top !== undefined && this.position.top !== '' ? `top:${this.position.top}` : ''}
          ${this.position.left !== undefined && this.position.left !== '' ? `left:${this.position.left}` : ''}
          ${this.position.bottom !== undefined && this.position.bottom !== '' ? `bottom:${this.position.bottom}` : ''}
          ${this.position.right !== undefined && this.position.right !== '' ? `right:${this.position.right}` : ''}
          background: ${this.options.background};
          ${this.options.height !== undefined ? `height: ${this.options.height}px` : ''}
          ${this.options.width !== undefined ? `width: ${this.options.width}px` : ''}
        }
      </style>
      <slot></slot>`;
  }

  attributeChangedCallback(): void {
    this.reload();
  }

  static get observedAttributes(): string[] {
    return ['position'];
  }
  get position(): PanelPosition {
    const position = this.getAttribute('position');
    if (position !== null) {
      try {
        const json = JSON.parse(position);
        return json;
      } catch {
        return {};
      }
    }
    return {};
  }
  get options(): PanelOptions {
    return this._options;
  }
  set options(opt: PanelOptions) {
    this._options = opt;
  }
}

customElements.define('panel', Panel);
