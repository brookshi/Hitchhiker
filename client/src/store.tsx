import { createStore, combineReducers } from 'redux';
import { todos } from './reducer/todos';

export function configureStore() {
    const store = createStore(
        combineReducers({ todos })
        // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    return store;
}