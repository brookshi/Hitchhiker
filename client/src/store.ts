import 'babel-polyfill';
import { createStore, applyMiddleware, compose } from 'redux';
import { rootReducer } from './reducer/index';
import createSagaMiddleware from 'redux-saga';
import { rootSaga, actionCreator } from './action';
import { StoreLocalDataType } from './action/local_data';
import { State } from './state/index';

const sagaMiddleware = createSagaMiddleware();

const reduxDebugFlag = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
const composeEnhancers = window[reduxDebugFlag] || compose;

let isStoring = false;

export function configureStore() {
    const store = createStore(
        rootReducer, {},
        composeEnhancers(
            applyMiddleware(sagaMiddleware)
        )
    );
    sagaMiddleware.run(rootSaga);
    store.subscribe(() => {
        const state: State = store.getState() as State;
        if (!isStoring && state.localDataState && state.localDataState.isLocalDataLoaded) {
            isStoring = true;
            console.log(store.getState());
            store.dispatch(actionCreator(StoreLocalDataType, store.getState()));
            isStoring = false;
        }
    });
    return store;
}