import { LoginSuccessType } from '../../action/user';
import { defaultStress, defaultStressRunResult } from './data';
import { stressDefaultValue } from '../../state/stress';
import { stressTestState } from '../stress';
import { SaveStressType, ActiveStressType, DeleteStressType, StressChunkDataType, RunStressFulfillType, StressStatusType } from '../../action/stress';
import { WorkerStatus } from '../../misc/stress_type';
import 'jest';

test('login success', () => {

    let state = stressTestState(stressDefaultValue, { type: LoginSuccessType, value: { result: { stresses: { ['123']: { id: '123', name: 'stress1', ['456']: { id: '456', name: 'stress2' } } } } } });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['123']: { id: '123', name: 'stress1', ['456']: { id: '456', name: 'stress2' } } }, activeStress: '123' });
});

test('save stress', () => {

    let state = stressTestState(stressDefaultValue, { type: SaveStressType, value: { stress: { id: '123', name: 'stress1' } } });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['123']: { id: '123', name: 'stress1' } }, activeStress: '123' });

    state = stressTestState(stressDefaultValue, { type: SaveStressType, value: { stress: { id: '123', name: 'stress2' } } });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['123']: { id: '123', name: 'stress2' } }, activeStress: '123' });

    state = stressTestState(state, { type: SaveStressType, value: { stress: { id: '456', name: 'stress3' } } });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['123']: { id: '123', name: 'stress2' }, ['456']: { id: '456', name: 'stress3' } }, activeStress: '456' });
});

test('active stress', () => {

    let oldState = { ...stressDefaultValue, stresses: { ['123']: { ...defaultStress, id: '123' }, ['456']: { ...defaultStress, id: '456', name: 'stress3' } }, activeStress: '123' };

    let state = stressTestState(oldState, { type: ActiveStressType, value: '456' });

    expect(state).toEqual({ ...oldState, activeStress: '456' });
});

test('delete stress', () => {

    let oldState = { ...stressDefaultValue, stresses: { ['123']: { ...defaultStress, id: '123' }, ['456']: { ...defaultStress, id: '456', name: 'stress3' } }, activeStress: '123' };

    let state = stressTestState(oldState, { type: DeleteStressType, value: '456' });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['123']: { ...defaultStress, id: '123' } }, activeStress: '123' });

    state = stressTestState(oldState, { type: DeleteStressType, value: '123' });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['456']: { ...defaultStress, id: '456', name: 'stress3' } }, activeStress: '456' });
});

test('update stress status', () => {

    let state = stressTestState(stressDefaultValue, { type: StressStatusType, value: { workerInfos: [{ addr: '192.169.0.3', cpuNum: 4, status: WorkerStatus.idle }], tasks: ['456', '789'], currentTask: 'task1', currentStressId: '123' } });

    expect(state).toEqual({ ...stressDefaultValue, workerInfos: [{ addr: '192.169.0.3', cpuNum: 4, status: WorkerStatus.idle }], tasks: ['123', '456', '789'], currentRunStressName: 'task1', currentRunStressId: '123' });
});

test('get stress chunk data', () => {

    let state = stressTestState(stressDefaultValue, { type: StressChunkDataType, value: { data: defaultStressRunResult } });

    expect(state).toEqual({ ...stressDefaultValue, runState: defaultStressRunResult });
});

test('run stress fulfill', () => {

    let oldState = { ...stressDefaultValue, tasks: ['345'], currentRunStressId: '123', currentRunStressName: 'task1', stresses: { ['123']: { ...defaultStress, id: '123' } } };

    let state = stressTestState(oldState, { type: RunStressFulfillType, value: { currentStressId: '123', data: defaultStressRunResult, tasks: ['345', '789'] } });

    expect(state).toEqual({ ...stressDefaultValue, stresses: { ['123']: { ...defaultStress, id: '123', stressRecords: [{ stressId: '123', result: defaultStressRunResult, createDate: state.stresses['123'].stressRecords[0].createDate }], lastRunDate: state.stresses['123'].lastRunDate } }, runState: undefined, tasks: ['345', '789'] });
});