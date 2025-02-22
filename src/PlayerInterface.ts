import { PlayerEventMap } from './events';
import WcPlayer from './Player';

export enum PlayerType {
  AUDIO,
  VIDEO,
}

export abstract class AbstractPlayer extends HTMLElement {
  get volume(): number {
    return 1;
  }
  set volume(volume: number) {
    throw new Error('Not Implemented');
  }
  get muted(): boolean {
    return false;
  }
  set muted(mute: boolean) {
    throw new Error('Not Implemented');
  }
  get duration(): number {
    return 0;
  }
  get currentTime(): number {
    return 0;
  }
  set currentTime(currentTime: number) {
    this.seek(currentTime);
  }
  get textTracks(): any[] {
    return [];
  }
  protected _playing = false;
  parent: WcPlayer;
  static platform: string;
  abstract getAvailableQualities(): Promise<number[]>;
  abstract play(): Promise<void>;
  abstract pause(): Promise<void>;
  abstract seek(t: number): Promise<void>;
  abstract stop(): Promise<void>;

  constructor(parent?: WcPlayer) {
    super();
    this.parent = parent;
  }

  static matchElement(el: Element): boolean {
    return this.match(el.getAttribute('src'));
  }

  static match(source: string): boolean {
    return false;
  }

  static get observedAttributes(): string[] {
    return ['source', 'type', 'quality'];
  }

  get autoplay(): boolean {
    return this.hasAttribute('autoplay');
  }
  get source(): string {
    return this.hasAttribute('source') ? this.getAttribute('source') : '';
  }

  set source(src: string) {
    if (src !== this.source) this.setAttribute('source', src);
  }

  get quality(): number {
    return this.hasAttribute('quality') ? parseInt(this.getAttribute('quality')) : 0;
  }

  set quality(quality: number) {
    if (quality !== this.quality) this.setAttribute('quality', quality.toString());
  }

  get playing(): boolean {
    return this._playing;
  }

  addEventListener<K extends keyof PlayerEventMap>(
    type: K,
    listener: (ev: CustomEvent<PlayerEventMap[K]>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof PlayerEventMap>(
    type: K,
    listener: (ev: CustomEvent<PlayerEventMap[K]>) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
  }

  emit<K extends keyof PlayerEventMap>(type: K, ev: PlayerEventMap[K]): void {
    super.dispatchEvent(
      new CustomEvent<PlayerEventMap[K]>(type, { detail: ev }),
    );
  }
}

export class PlayerConstructor extends AbstractPlayer {
  play(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  pause(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  seek(t: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  stop(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getAvailableQualities(): Promise<number[]> {
    throw new Error('Method not implemented.');
  }
}
