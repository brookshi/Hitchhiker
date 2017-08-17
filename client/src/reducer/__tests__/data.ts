import { Period } from '../../common/period';
import { NotificationMode } from '../../common/notification_mode';

export const defaultSchedule = {
    id: '123',
    name: 'schedule1',
    collectionId: 'cid_123',
    environmentId: 'eid_123',
    needCompare: false,
    compareEnvironmentId: 'eid_456',
    period: Period.daily,
    hour: 10,
    notification: NotificationMode.me,
    emails: '',
    needOrder: false,
    recordsOrder: '',
    suspend: false,
    scheduleRecords: [],
    ownerId: '',
    lastRunDate: new Date(2017, 8, 5)
};

export const defaultUser = {
    id: 'uid_123',
    name: 'user1',
    password: 'pwd',
    email: 'a@a.aa',
    projects: [],
    isActive: true,
    createDate: new Date(),
    updateDate: new Date(),
};

export const defaultRunResult = {
    id: '123',
    envId: 'env1',
    error: { message: 'error', stack: 'throw' },
    body: 'body1',
    tests: { ['test result']: true },
    variables: { isSuccess: true },
    status: 200,
    statusMessage: 'OK',
    elapsed: 100,
    headers: { ['key1']: 'value1' },
    cookies: ['ck1=ck2;'],
    host: 'hitchhiker-api.com'
};

test('move record');