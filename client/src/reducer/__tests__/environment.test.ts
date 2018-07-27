import { environmentDefaultValue } from '../../state/environment';
import { LoginSuccessType } from '../../action/user';
import { actionCreator } from '../../action/index';
import { environmentState } from '../environment';
import { SaveEnvironmentType, QuitProjectType, DisbandProjectType, DelEnvironmentType, SwitchEnvType, EditEnvType, EditEnvCompletedType } from '../../action/project';
import { noEnvironment } from '../../misc/constants';
import 'jest';

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

test('quit project', () => {

    let oldState = { ...environmentDefaultValue, environments: { ['project1']: [{ id: '123', name: 'env1', project: { id: 'project1' }, variables: [] }] } };

    let state = environmentState(oldState, actionCreator(QuitProjectType, { id: 'project1' }));

    expect(state).toEqual({ ...environmentDefaultValue, environments: {} });
});

test('disband project', () => {

    let oldState = { ...environmentDefaultValue, environments: { ['project1']: [{ id: '123', name: 'env1', project: { id: 'project1' }, variables: [] }] } };

    let state = environmentState(oldState, actionCreator(DisbandProjectType, { id: 'project1' }));

    expect(state).toEqual({ ...environmentDefaultValue, environments: {} });
});

test('delete environment', () => {

    let oldState = { ...environmentDefaultValue, environments: { ['project1']: [{ id: '123', name: 'env1', project: { id: 'project1' }, variables: [] }, { id: '456', name: 'env2', project: { id: 'project1' }, variables: [] }] } };

    let state = environmentState(oldState, actionCreator(DelEnvironmentType, { projectId: 'project1', envId: '123' }));

    expect(state).toEqual({ ...environmentDefaultValue, environments: { ['project1']: [{ id: '456', name: 'env2', project: { id: 'project1' }, variables: [] }] } });
});

test('switch environment in collection module', () => {

    let oldState = { ...environmentDefaultValue, activeEnv: { ['project1']: '123' } };

    let state = environmentState(oldState, actionCreator(SwitchEnvType, { projectId: 'project1', envId: '456' }));

    expect(state).toEqual({ ...environmentDefaultValue, activeEnv: { ['project1']: '456' } });

    state = environmentState(oldState, actionCreator(SwitchEnvType, { projectId: 'project2', envId: '456' }));

    expect(state).toEqual({ ...environmentDefaultValue, activeEnv: { ['project1']: '123', ['project2']: '456' } });
});

test('click edit environment button in collection module', () => {

    let oldState = { ...environmentDefaultValue, isEditEnvDlgOpen: false, editedEnvironment: '123' };

    let state = environmentState(oldState, actionCreator(EditEnvType, { envId: noEnvironment }));

    expect(state).toEqual({ ...environmentDefaultValue, isEditEnvDlgOpen: false, editedEnvironment: noEnvironment });

    state = environmentState(oldState, actionCreator(EditEnvType, { envId: '456' }));

    expect(state).toEqual({ ...environmentDefaultValue, isEditEnvDlgOpen: true, editedEnvironment: '456' });
});

test('edit environment complete', () => {

    let oldState = { ...environmentDefaultValue, isEditEnvDlgOpen: true, editedEnvironment: '123' };

    let state = environmentState(oldState, actionCreator(EditEnvCompletedType));

    expect(state).toEqual({ ...environmentDefaultValue, isEditEnvDlgOpen: false, editedEnvironment: undefined });
});