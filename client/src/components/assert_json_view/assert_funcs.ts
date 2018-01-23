export type AssertType = 'array' | 'string' | 'number' | 'boolean';

export const arrayFuncs = ['length >', 'length ==', 'length <', 'includes', 'every', 'some', 'custom'];

export const stringFuncs = ['length >', 'length ==', 'length <', 'includes', 'startsWith', 'endsWith', 'custom'];

export const numberFuncs = ['>', '>=', '==', '<', '<='];

export const booleanFuncs = ['true', 'false'];

export const AssertTypeFuncMapping = {
    array: arrayFuncs,
    string: stringFuncs,
    number: numberFuncs,
    boolean: booleanFuncs
};