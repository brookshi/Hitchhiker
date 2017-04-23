import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './reducer/index';
import { initialState } from './state';

const epicMiddleware = createEpicMiddleware(rootEpic);

const reduxDebugFlag = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
const composeEnhancers = window[reduxDebugFlag] || compose;

export function configureStore() {
    const store = createStore(
        rootReducer, initialState,
        composeEnhancers(
            applyMiddleware(epicMiddleware)
        )
    );
    return store;
}