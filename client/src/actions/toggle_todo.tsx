
export const toggleType: string = 'toggle';

export const toggleTodo = (id: number) => {
    return {
        type: toggleType,
        id: id
    };
};