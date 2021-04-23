import { AbstractPlayer } from './PlayerInterface';

export type PlayerEvent = {
  player: AbstractPlayer;
};

export interface PlayerEventMap {
  ready: PlayerEvent;
  playing: PlayerEvent;
  waiting: PlayerEvent;
  pause: PlayerEvent;
  timeupdate: PlayerEvent;
  durationchange: PlayerEvent;
  ended: PlayerEvent;
  qualitychange: PlayerEvent;
  playbackratechange: PlayerEvent;
  error: PlayerEvent;
}

export interface ControlsEventMap {
  toggle_play: {};
}
