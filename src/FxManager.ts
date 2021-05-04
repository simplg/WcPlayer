import WcPlayer from './Player';

export interface Fx {
  listen(): void;
  remove(): void;
}
export class HideControlFx implements Fx {
  timer: number;
  parent: WcPlayer;
  constructor(parent: WcPlayer) {
    this.parent = parent;
  }
  listen(): void {
    this.hide();
    this.parent.controls.addEventListener('mousemove', this.show.bind(this));
    this.parent.addEventListener('mousemove', this.show.bind(this));
  }
  show(): void {
    this.parent.controls.classList.remove('hide');
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.hide();
    }, 3000);
  }
  hide(): void {
    this.parent.controls.classList.add('hide');
  }
  remove(): void {
    this.parent.controls.classList.remove('hide');
  }
}

export class WidthZeroFx implements Fx {
  element: HTMLElement;
  parent: HTMLElement;
  constructor(element: HTMLElement, parent: HTMLElement) {
    this.element = element;
    this.parent = parent;
  }
  listen(): void {
    this.parent.addEventListener('mouseover', this.show.bind(this));
    this.parent.addEventListener('mouseout', this.hide.bind(this));
  }
  show(): void {
    this.element.classList.remove('hide');
  }
  hide(): void {
    this.element.classList.add('hide');
  }
  remove(): void {
    this.parent.removeEventListener('mouseover', this.show.bind(this));
    this.parent.removeEventListener('mouseout', this.hide.bind(this));
  }
}

export class FxManager {
  private fxList: Map<string, Fx> = new Map();
  add(name: string, fx: Fx): void {
    this.fxList.set(name, fx);
    fx.listen();
  }
  has(name: string): boolean {
    return this.fxList.has(name);
  }
  remove(name: string): void {
    const fx = this.fxList.get(name);
    if (fx !== undefined) {
      fx.remove();
      this.fxList.delete(name);
    }
  }
}
