import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from "redux-observable";
import { rootEpic, rootReducer } from "./reducer/index";
//import { todos } from './reducer/todos';

const epicMiddleware = createEpicMiddleware(rootEpic);

// tslint:disable-next-line:no-any
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

//export const enhancer = window['devToolsExtension'] ? window['devToolsExtension']()(createStore) : createStore;

// let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f: any) => f;
//let middleware = applyMiddleware(epicMiddleware);
//export const store: any = middleware(enhancer)(rootReducer);


export function configureStore() {
    const store = createStore(
        //combineReducers({todos})
        rootReducer, {},
        composeEnhancers(
            applyMiddleware(epicMiddleware)
        )
        // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    return store;
}