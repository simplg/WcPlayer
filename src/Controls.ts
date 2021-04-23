import PlayButton from './controls/PlayButton';
import { VolumeElement } from './controls/VolumeElement';
import TimerElement from './controls/TimerElement';
import { SeekElement } from './controls/SeekElement';
import SettingsButton from './controls/SettingsButton';
import FullscreenButton from './controls/FullscreenButton';
import PiPButton from './controls/PiPButton';
import { ControlsEventMap } from './events';

export interface ControlElements {
  playPauseButton: HTMLElement;
  volumeButton: HTMLElement;
  timerElement: HTMLElement;
  seekElement: HTMLElement;
  settingsButton: HTMLElement;
  fullscreenButton: HTMLElement;
  pipButton: HTMLElement;
}

export interface PanelElements {
  settingsPanel: HTMLElement;
  volumePanel: HTMLElement;
}

export interface WcControlsProps {
  controls: ControlElements;
  panels: PanelElements;
}

export class WcControls extends HTMLElement {
  controls: ControlElements;
  panels: PanelElements;
  constructor(props?: Partial<WcControlsProps>) {
    super();
    this.controls = {
      playPauseButton: props?.controls.playPauseButton || new PlayButton(),
      volumeButton: props?.controls.volumeButton || new VolumeElement(),
      timerElement: props?.controls.timerElement || new TimerElement(),
      seekElement: props?.controls.seekElement || new SeekElement(),
      settingsButton: props?.controls.settingsButton || new SettingsButton(),
      fullscreenButton: props?.controls.fullscreenButton || new FullscreenButton(),
      pipButton: props?.controls.pipButton || new PiPButton(),
    };
    this.panels = {
      settingsPanel: props?.panels.settingsPanel || null,
      volumePanel: props?.panels.volumePanel || new VolumeElement(),
    };
    this.attachEvents();
    this.attachShadow({ mode: 'open' });
  }

  reload(): void {
    this.shadowRoot.innerHTML = this.build();
    const wrapper = this.shadowRoot.querySelector('.controls');
    Object.keys(this.controls).forEach((key: keyof ControlElements) => {
      if (this.controls[key] !== null) wrapper.appendChild(this.controls[key]);
    });
    Object.keys(this.panels).forEach((key: keyof PanelElements) => {
      if (this.panels[key] !== null) this.shadowRoot.appendChild(this.panels[key]);
    });
  }
  attachEvents(): void {
    this.controls.playPauseButton.addEventListener('click', (e) => {
      this.emit('toggle_play', {});
    });
  }

  build(): string {
    return `<style>
        .controls {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 40px;
          overflow: hidden;
        }
      </style>
      <div class="controls"></div>`;
  }
  addEventListener<K extends keyof ControlsEventMap>(
    type: K,
    listener: (ev: CustomEvent<ControlsEventMap[K]>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof ControlsEventMap>(
    type: K,
    listener: (ev: CustomEvent<ControlsEventMap[K]>) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
  }

  emit<K extends keyof ControlsEventMap>(type: K, ev: ControlsEventMap[K]): void {
    super.dispatchEvent(
      new CustomEvent<ControlsEventMap[K]>(type, { detail: ev }),
    );
  }
}

customElements.define('wc-controls', WcControls);
