
let _index = 1;

export const addTodoType = 'addtodo';

export const addTodo = (text: string) => {
    return {
        type: addTodoType,
        id: _index++,
        text: text
    };
};