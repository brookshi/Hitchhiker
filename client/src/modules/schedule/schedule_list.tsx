import React from 'react';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import ScheduleItem from './schedule_item';
import { SelectParam } from 'antd/lib/menu';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { StringUtil } from '../../utils/string_util';
import { Tooltip, Button, Menu } from 'antd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ScheduleEditDialog from './schedule_edit_dialog';
import { Period } from '../../common/period';
import { NotificationMode } from '../../common/notification_mode';
import { noEnvironment } from '../../common/constants';
import { DateUtil } from '../../utils/date_util';
import * as _ from 'lodash';
import { ScheduleRunState } from '../../state/schedule';
import { DtoRecord } from '../../../../api/interfaces/dto_record';

interface ScheduleListProps {

    user: DtoUser;

    activeSchedule: string;

    schedules: DtoSchedule[];

    collections: _.Dictionary<string>;

    environments: _.Dictionary<string>;

    records: _.Dictionary<DtoRecord>;

    runState: _.Dictionary<ScheduleRunState>;

    createSchedule(schedule: DtoSchedule);

    selectSchedule(scheduleId: string);

    updateSchedule(schedule: DtoSchedule);

    deleteSchedule(scheduleId: string);

    runSchedule(scheduleId: string);
}

interface ScheduleListState {

    schedule: DtoSchedule;

    isCreateNew: boolean;

    isEditDlgOpen: boolean;

    isEditDlgRendered: boolean;
}

const createDefaultSchedule: (user: DtoUser) => DtoSchedule = (user: DtoUser) => {
    return {
        id: StringUtil.generateUID(),
        name: 'New Schedule',
        ownerId: user.id,
        collectionId: '',
        environmentId: noEnvironment,
        needCompare: false,
        compareEnvironmentId: noEnvironment,
        period: Period.daily,
        hour: DateUtil.localHourToUTC(7),
        notification: NotificationMode.none,
        emails: '',
        needOrder: false,
        recordsOrder: '',
        suspend: false,
        scheduleRecords: []
    };
};

class ScheduleList extends React.Component<ScheduleListProps, ScheduleListState> {

    constructor(props: ScheduleListProps) {
        super(props);
        this.state = {
            schedule: createDefaultSchedule(props.user),
            isCreateNew: true,
            isEditDlgOpen: false,
            isEditDlgRendered: false
        };
    }

    public shouldComponentUpdate(nextProps: ScheduleListProps, nextState: ScheduleListState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.selectSchedule(param.item.props.data.id);
    }

    private onCreateSchedule = () => {
        this.setState({
            ...this.state,
            isEditDlgOpen: true,
            isCreateNew: true,
            schedule: createDefaultSchedule(this.props.user),
            isEditDlgRendered: false
        });
    }

    private saveSchedule = (schedule) => {
        this.setState({ ...this.state, isEditDlgOpen: false });
        this.state.isCreateNew ? this.props.createSchedule(schedule) : this.props.updateSchedule(schedule);
    }

    private editSchedule = (schedule) => {
        this.setState({
            ...this.state,
            isEditDlgOpen: true,
            isCreateNew: false,
            isEditDlgRendered: false,
            schedule: { ...schedule, environmentId: schedule.environmentId || noEnvironment }
        });
    }

    public render() {
        const { runState, activeSchedule, schedules, collections, environments, user, deleteSchedule, runSchedule, updateSchedule } = this.props;
        return (
            <div>
                <div className="small-toolbar">
                    <span>Schedules</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create schedule">
                        <Button
                            className="icon-btn schedule-add-btn"
                            type="primary"
                            icon="file-add"
                            onClick={this.onCreateSchedule}
                        />
                    </Tooltip>
                </div>
                <PerfectScrollbar>
                    <Menu
                        className="project-list"
                        mode="inline"
                        inlineIndent={0}
                        selectedKeys={[activeSchedule]}
                        onSelect={this.onSelectChanged}
                    >
                        {
                            schedules.map(t =>
                                (
                                    <Menu.Item key={t.id} data={t}>
                                        <ScheduleItem
                                            schedule={t}
                                            collectionName={collections[t.collectionId]}
                                            environmentName={environments[t.environmentId]}
                                            isOwner={t.ownerId === user.id}
                                            delete={() => deleteSchedule(t.id)}
                                            edit={() => this.editSchedule(t)}
                                            run={() => runSchedule(t.id)}
                                            suspend={() => updateSchedule({ ...t, suspend: !t.suspend })}
                                            isRunning={runState[t.id] ? runState[t.id].isRunning : false}
                                        />
                                    </Menu.Item>
                                )
                            )
                        }
                    </Menu>
                </PerfectScrollbar>
                <ScheduleEditDialog
                    schedule={this.state.schedule}
                    collections={collections}
                    environments={environments}
                    isEditDlgOpen={this.state.isEditDlgOpen}
                    records={_.values(this.props.records)}
                    isRendered={this.state.isEditDlgRendered}
                    render={() => this.setState({ ...this.state, isEditDlgRendered: true })}
                    onCancel={() => this.setState({ ...this.state, isEditDlgOpen: false })}
                    onOk={schedule => this.saveSchedule(schedule)}
                />
            </div>
        );
    }
}

export default ScheduleList;