import WcPlayer from './Player';
import { StoreInterface, WcProperties } from './StoreInterface';

export default class LocalStore implements StoreInterface {
  get<K extends keyof WcProperties>(parent: WcPlayer, key: K): WcProperties[K] {
    const item = localStorage.getItem(key);
    switch (key) {
      case 'muted':
        return (item == '1') as WcProperties[K];
      case 'volume':
        const vol = parseFloat(item) || 1;
        return vol as WcProperties[K];
    }
  }
  set<K extends keyof WcProperties>(parent: WcPlayer, key: K, value: WcProperties[K]): void {
    localStorage.setItem(key, value.toString());
  }
}
