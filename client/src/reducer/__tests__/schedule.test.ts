import { scheduleDefaultValue } from '../../state/schedule';
import { scheduleState } from '../schedule';
import { LoginSuccessType } from '../../action/user';
import { SaveScheduleType, ActiveScheduleType, DeleteScheduleType, RunScheduleType, ScheduleChunkDataType, RunScheduleFulfillType } from '../../action/schedule';
import { defaultSchedule } from './data';
import 'jest';

test('login success', () => {

    let state = scheduleState(scheduleDefaultValue, { type: LoginSuccessType, value: { result: { schedules: { ['123']: { id: '123', name: 'schedule1', ['456']: { id: '456', name: 'schedule2' } } } } } });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { id: '123', name: 'schedule1', ['456']: { id: '456', name: 'schedule2' } } }, activeSchedule: '123' });
});

test('save schedule', () => {

    let state = scheduleState(scheduleDefaultValue, { type: SaveScheduleType, value: { schedule: { id: '123', name: 'schedule1' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { id: '123', name: 'schedule1' } }, activeSchedule: '123' });

    state = scheduleState(scheduleDefaultValue, { type: SaveScheduleType, value: { schedule: { id: '123', name: 'schedule2' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { id: '123', name: 'schedule2' } }, activeSchedule: '123' });

    state = scheduleState(state, { type: SaveScheduleType, value: { schedule: { id: '456', name: 'schedule3' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { id: '123', name: 'schedule2' }, ['456']: { id: '456', name: 'schedule3' } }, activeSchedule: '456' });
});

test('active schedule', () => {

    let oldState = { ...scheduleDefaultValue, schedules: { ['123']: { ...defaultSchedule, id: '123' }, ['456']: { ...defaultSchedule, id: '456', name: 'schedule3' } }, activeSchedule: '123' };

    let state = scheduleState(oldState, { type: ActiveScheduleType, value: '456' });

    expect(state).toEqual({ ...oldState, activeSchedule: '456' });
});

test('delete schedule', () => {

    let oldState = { ...scheduleDefaultValue, schedules: { ['123']: { ...defaultSchedule, id: '123' }, ['456']: { ...defaultSchedule, id: '456', name: 'schedule3' } }, activeSchedule: '123' };

    let state = scheduleState(oldState, { type: DeleteScheduleType, value: '456' });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { ...defaultSchedule, id: '123' } }, activeSchedule: '123' });

    state = scheduleState(oldState, { type: DeleteScheduleType, value: '123' });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['456']: { ...defaultSchedule, id: '456', name: 'schedule3' } }, activeSchedule: '456' });
});

test('run schedule', () => {

    let state = scheduleState(scheduleDefaultValue, { type: RunScheduleType, value: '123' });

    expect(state).toEqual({ ...scheduleDefaultValue, runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: true, consoleRunResults: [] } } });
});

test('get schedule chunk data', () => {

    let oldState = { ...scheduleDefaultValue, runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: true, consoleRunResults: [] } } };

    let state = scheduleState(oldState, { type: ScheduleChunkDataType, value: { id: '123', data: { id: 'data1' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: true, consoleRunResults: [{ id: 'data1' }] } } });

    state = scheduleState(state, { type: ScheduleChunkDataType, value: { id: '123', data: { id: 'data2' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: true, consoleRunResults: [{ id: 'data1' }, { id: 'data2' }] } } });

    state = scheduleState({ ...state, runState: { ...state.runState, ['456']: { isRunning: true, consoleRunResults: [] } } }, { type: ScheduleChunkDataType, value: { id: '456', data: { id: 'data3' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: true, consoleRunResults: [{ id: 'data1' }, { id: 'data2' }] }, ['456']: { isRunning: true, consoleRunResults: [{ id: 'data3' }] } } });
});

test('run schedule fulfill', () => {

    let oldState = { ...scheduleDefaultValue, schedules: { ['123']: { ...defaultSchedule, id: '123' } }, activeSchedule: '123' };

    let state = scheduleState(oldState, { type: RunScheduleFulfillType, value: { id: '123', data: { isResult: true } } });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { ...defaultSchedule, id: '123', scheduleRecords: [], lastRunDate: state.schedules['123'].lastRunDate } }, activeSchedule: '123', runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: false, consoleRunResults: [] } } });

    state = scheduleState(oldState, { type: RunScheduleFulfillType, value: { id: '123', data: { isResult: true, id: 'data1' } } });

    expect(state).toEqual({ ...scheduleDefaultValue, schedules: { ['123']: { ...defaultSchedule, id: '123', scheduleRecords: [{ isResult: true, id: 'data1' }], lastRunDate: state.schedules['123'].lastRunDate } }, activeSchedule: '123', runState: { ...scheduleDefaultValue.runState, ['123']: { isRunning: false, consoleRunResults: [] } } });
});