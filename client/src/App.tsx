import * as React from 'react';
import './App.css';
//import TodoList from './components/todo_list';
import CollectionList from './components/collection_list';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <CollectionList />
      </div>
    );
  }
}

export default App;
