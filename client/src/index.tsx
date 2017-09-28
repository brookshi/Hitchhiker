import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import LocalStore from './utils/local_store';
import { StressWS } from './action/stress';

LocalStore.init();

StressWS.instance.initStressWS();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);