import * as React from 'react';
import { TodoItem } from "../reducer/todos";
import { toggleTodo } from '../actions/toggle_todo';
import { addTodo } from '../actions/add_todo';
import { connect } from "react-redux";
import { TodoState } from '../reducer/todos';
import { Dispatch } from "redux";

interface TodoProps {
    todos: TodoItem[];
}

interface TodoDispatchProps {
    add: (text: string) => void;
    click: (id: number) => void;
}

class TodoList extends React.Component<TodoProps & TodoDispatchProps, any>{

    constructor() {
        super();
    }

    render() {
        let input;
        return (
            <div>
                <span>
                    <input ref={node => { input = node; }} />
                </span>
                <button onClick={() => this.props.add(input.value)} />
                <ul>
                    {
                        this.props.todos ?
                            this.props.todos.map(todo => {
                                return (
                                    <li
                                        id={todo.id.toString()}
                                        onClick={() => this.props.click(todo.id)}
                                    >
                                        {todo.text}
                                    </li>
                                );
                            }) : <li />
                    }
                </ul>
            </div >
        );
    }
};

function mapStateToProps(state: TodoState): TodoProps {
    return { todos: state.todos };
}

function mapDispatchToProps(dispatch: Dispatch<TodoDispatchProps>): TodoDispatchProps {
    return {
        add: (text: string) => dispatch(addTodo(text)),
        click: (id: number) => dispatch(toggleTodo(id))
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TodoList);