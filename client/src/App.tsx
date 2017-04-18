import * as React from 'react';
import './App.css';
import TodoList from './components/todo_list';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <TodoList />
      </div>
    );
  }
}

export default App;
