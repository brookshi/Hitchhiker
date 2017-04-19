import { DtoCollection } from "../../../api/interfaces/dto_collection";

export function collections(state: DtoCollection[] = [], action: any): DtoCollection[] {
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