import { projectState } from '../project';
import { projectDefaultValue } from '../../state/project';
import { LoginSuccessType } from '../../action/user';
import { SaveProjectType, ActiveProjectType, QuitProjectType, DisbandProjectType, EditEnvType, RemoveUserType, SaveLocalhostMappingType } from '../../action/project';

const defaultUser = {
    id: 'uid_123',
    name: 'user1',
    password: 'pwd',
    email: 'a@a.aa',
    projects: [],
    isActive: true,
    createDate: new Date(),
    updateDate: new Date(),
};

test('login success', () => {

    let state = projectState(projectDefaultValue, { type: LoginSuccessType, value: { result: { projects: { ['123']: { id: '123', name: 'project1', ['456']: { id: '456', name: 'project2' } } } } } });

    expect(state).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', ['456']: { id: '456', name: 'project2' } } }, activeProject: '123' });
});

test('save project', () => {

    let state = projectState(projectDefaultValue, { type: SaveProjectType, value: { project: { id: '123', name: 'project1' } } });

    expect(state).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1' } }, activeProject: '123' });

    state = projectState(projectDefaultValue, { type: SaveProjectType, value: { project: { id: '123', name: 'project2' } } });

    expect(state).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project2' } }, activeProject: '123' });

    state = projectState(state, { type: SaveProjectType, value: { project: { id: '456', name: 'project3' } } });

    expect(state).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project2' }, ['456']: { id: '456', name: 'project3' } }, activeProject: '456' });
});

test('active project', () => {

    let oldState = { ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {} }, ['456']: { id: '456', name: 'project2', owner: {} } }, activeProject: '123' };

    let state = projectState(oldState, { type: ActiveProjectType, value: '456' });

    expect(state).toEqual({ ...oldState, activeProject: '456' });
});

test('quit/disband team', () => {

    let oldState = { ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {} }, ['456']: { id: '456', name: 'project2', owner: {} } }, activeProject: '123' };

    expect(projectState(oldState, { type: QuitProjectType, value: { id: '456' } })).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {} } }, activeProject: '123' });

    expect(projectState(oldState, { type: DisbandProjectType, value: { id: '456' } })).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {} } }, activeProject: '123' });

    expect(projectState(oldState, { type: QuitProjectType, value: { id: '123' } })).toEqual({ ...projectDefaultValue, projects: { ['456']: { id: '456', name: 'project2', owner: {} } }, activeProject: '456' });

    expect(projectState(oldState, { type: DisbandProjectType, value: { id: '123' } })).toEqual({ ...projectDefaultValue, projects: { ['456']: { id: '456', name: 'project2', owner: {} } }, activeProject: '456' });
});

test('click edit environment button in collection', () => {

    let oldState = { ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {} }, ['456']: { id: '456', name: 'project2', owner: {} } }, activeProject: '123' };

    let state = projectState(oldState, { type: EditEnvType, value: { projectId: '456' } });

    expect(state).toEqual({ ...oldState, activeProject: '456' });
});

test('remove user', () => {

    let oldState = { ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {}, members: [{ ...defaultUser, id: 'uid_123' }, { ...defaultUser, id: 'uid_456' }] } } };

    let state = projectState(oldState, { type: RemoveUserType, value: { projectId: '123', userId: 'uid_123' } });

    expect(state).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {}, members: [{ ...defaultUser, id: 'uid_456' }] } } });
});

test('save localhost mapping', () => {

    let oldState = { ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {}, localhosts: [{ id: 'lid_123', userId: 'uid_123', ip: '192.168.0.2' }] }, ['456']: { id: '456', name: 'project2', owner: {} } } };

    let state = projectState(oldState, { type: SaveLocalhostMappingType, value: { isNew: true, id: 'lid_456', projectId: '123', userId: 'uid_456', ip: '192.168.0.3' } });

    const localhosts = state.projects['123'].localhosts;

    expect(localhosts ? localhosts.length : 0).toEqual(2);

    expect(localhosts ? { ...localhosts[1], id: '', project: {} } : {}).toEqual({ id: '', userId: 'uid_456', ip: '192.168.0.3', project: {} });

    state = projectState(oldState, { type: SaveLocalhostMappingType, value: { isNew: false, id: 'lid_123', projectId: '123', userId: 'uid_123', ip: '192.168.0.4' } });

    expect(state).toEqual({ ...projectDefaultValue, projects: { ['123']: { id: '123', name: 'project1', owner: {}, localhosts: [{ id: 'lid_123', userId: 'uid_123', ip: '192.168.0.4' }] }, ['456']: { id: '456', name: 'project2', owner: {} } } });
});