
import { addTodoType } from "../actions/add_todo";
import { toggleTodo } from "../actions/toggle_todo";

export interface TodoItem {
    id: number;
    text: string;
    isFinish: boolean;
}

export interface TodoState {
    todos: TodoItem[];
}

export function todos(state: TodoItem[] = [], action: any): TodoItem[] {
    switch (action.type) {
        case addTodoType:
            return [...state, {
                id: action.id,
                text: action.text,
                isFinish: false
            }];
        case toggleTodo:
            return state.map(s => {
                if (s.id === action.id) {
                    return Object.assign({}, s, { isFinish: !s.isFinish });
                } else {
                    return s;
                }
            });
        default:
            return state;
    }
};