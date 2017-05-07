import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import { configureStore } from './store';
import App from './App';
import "regenerator-runtime/runtime";

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
