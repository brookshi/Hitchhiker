import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { Provider } from "react-redux";
import { configureStore } from "./store";
//import TodoList from "./components/todo_list";
import { Button } from 'antd';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Button type="primary">Button</Button>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
