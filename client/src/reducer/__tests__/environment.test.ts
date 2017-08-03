import { environmentDefaultValue } from '../../state/environment';
import { LoginSuccessType } from '../../action/user';
import { actionCreator } from '../../action/index';
import { environmentState } from '../environment';
import { SaveEnvironmentType } from '../../action/project';

test('login success', () => {

    let state = environmentState(environmentDefaultValue, actionCreator(LoginSuccessType, { result: { environments: { ['123']: [] } } }));

    expect(state).toEqual({ ...environmentDefaultValue, environments: { ['123']: [] } });
});

test('save environment', () => {

    let state = environmentState(environmentDefaultValue, actionCreator(SaveEnvironmentType, { isNew: true, env: { id: '123', name: 'env1', project: { id: 'project1' }, variables: [] } }));

    expect(state).toEqual({ ...environmentDefaultValue, environments: { ['project1']: [{ id: '123', name: 'env1', project: { id: 'project1' }, variables: [] }] } });

    state = environmentState(environmentDefaultValue, actionCreator(SaveEnvironmentType, { isNew: false, env: { id: '456', name: 'env2', project: { id: 'project1' }, variables: [] } }));

    expect(state).toEqual({ ...environmentDefaultValue, environments: { ['project1']: [{ id: '456', name: 'env2', project: { id: 'project1' }, variables: [] }] } });
});