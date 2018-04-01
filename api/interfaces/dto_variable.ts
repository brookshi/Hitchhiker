export interface DtoVariable {

    id: string;

    key?: string;

    value?: string;

    isActive: boolean;

    sort: number;
}

export interface DtoQueryString extends DtoVariable {

    description?: string;
}