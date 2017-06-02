import localForage from 'localforage';
import { State } from '../state/index';

export default class LocalStore {

    static init() {
        localForage.config({
            name: 'hitchhiker',
            version: 1.0,
            storeName: 'localState'
        });
    }

    static async setState(state: State): Promise<void> {
        await localForage.setItem('state', state);
    }

    static async getState(): Promise<State> {
        return await localForage.getItem('state') as State;
    }
}