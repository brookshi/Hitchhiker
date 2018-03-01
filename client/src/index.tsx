import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import * as l from './locales/lang';
import App from './App';
import LocalStore from './utils/local_store';
import { LocaleProvider } from 'antd';
import { addLocaleData, IntlProvider } from 'react-intl';

const appLocale = l.language['en'];

addLocaleData(appLocale.data);

LocalStore.init();

ReactDOM.render(
  <LocaleProvider locale={appLocale.antd}>
    <IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
      <Provider store={store}>
        <App />
      </Provider>
    </IntlProvider>
  </LocaleProvider>,
  document.getElementById('root') as HTMLElement
);