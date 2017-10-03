import React from 'react';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import { SelectParam } from 'antd/lib/menu';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { StringUtil } from '../../utils/string_util';
import { Tooltip, Button, Menu } from 'antd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Period } from '../../common/period';
import { NotificationMode } from '../../common/notification_mode';
import { noEnvironment, newScheduleName, unknownName } from '../../common/constants';
import { DateUtil } from '../../utils/date_util';
import * as _ from 'lodash';
import { ScheduleRunState } from '../../state/schedule';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import StressItem from './stress_item';

interface StressListProps {

    user: DtoUser;

    activeStress: string;

    currnetRunStress: string;

    stresses: DtoStress[];

    collections: _.Dictionary<DtoCollection>;

    environments: _.Dictionary<DtoEnvironment[]>;

    records: _.Dictionary<DtoRecord>;

    createStress(stress: DtoStress);

    selectStress(stressId: string);

    updateStress(stress: DtoStress);

    deleteStress(stressId: string);

    runStress(stressId: string);
}

interface StressListState {

    stress: DtoStress;

    isCreateNew: boolean;

    isEditDlgOpen: boolean;

    isEditDlgRendered: boolean;
}

const createDefaultStress: (user: DtoUser) => DtoStress = (user: DtoUser) => {
    return {
        id: StringUtil.generateUID(),
        name: newScheduleName,
        ownerId: user.id,
        collectionId: '',
        environmentId: noEnvironment,
        concurrencyCount: 1,
        totalCount: 1,
        qps: 0,
        timeout: 0,
        excludeRecords: [],
        notification: NotificationMode.none,
        emails: '',
        stressRecords: []
    };
};

class StressList extends React.Component<StressListProps, StressListState> {

    constructor(props: StressListProps) {
        super(props);
        this.state = {
            stress: createDefaultStress(props.user),
            isCreateNew: true,
            isEditDlgOpen: false,
            isEditDlgRendered: false
        };
    }

    public shouldComponentUpdate(nextProps: StressListProps, nextState: StressListState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.selectStress(param.item.props.data.id);
    }

    private onCreateStress = () => {
        this.setState({
            ...this.state,
            isEditDlgOpen: true,
            isCreateNew: true,
            stress: createDefaultStress(this.props.user),
            isEditDlgRendered: false
        });
    }

    // private saveStress = (stress) => {
    //     this.setState({ ...this.state, isEditDlgOpen: false });
    //     this.state.isCreateNew ? this.props.createStress(stress) : this.props.updateStress(stress);
    // }

    private editStress = (stress) => {
        this.setState({
            ...this.state,
            isEditDlgOpen: true,
            isCreateNew: false,
            isEditDlgRendered: false,
            stress: { ...stress, environmentId: stress.environmentId || noEnvironment }
        });
    }

    private getEnvName = (envId: string) => {
        return !envId || envId === noEnvironment ? noEnvironment : (this.getEnvNames()[envId] || unknownName);
    }

    private getEnvNames = () => {
        const environmentNames: _.Dictionary<string> = {};
        _.chain(this.props.environments).values().flatten<DtoEnvironment>().value().forEach(e => environmentNames[e.id] = e.name);
        return environmentNames;
    }

    public render() {
        const { activeStress, currnetRunStress, stresses, collections, environments, user, deleteStress, runStress, updateStress } = this.props;
        return (
            <div>
                <div className="small-toolbar">
                    <span>Stresses</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create stress">
                        <Button
                            className="icon-btn stress-add-btn"
                            type="primary"
                            icon="file-add"
                            onClick={this.onCreateStress}
                        />
                    </Tooltip>
                </div>
                <PerfectScrollbar>
                    <Menu
                        className="project-list"
                        mode="inline"
                        inlineIndent={0}
                        selectedKeys={[activeStress]}
                        onSelect={this.onSelectChanged}
                    >
                        {
                            stresses.map(t =>
                                (
                                    <Menu.Item key={t.id} data={t}>
                                        <StressItem
                                            stress={t}
                                            isOwner={t.ownerId === user.id}
                                            delete={() => deleteStress(t.id)}
                                            edit={() => this.editStress(t)}
                                            run={() => runStress(t.id)}
                                            isRunning={currnetRunStress === t.id}
                                        />
                                    </Menu.Item>
                                )
                            )
                        }
                    </Menu>
                </PerfectScrollbar>
                {/* <ScheduleEditDialog
                    schedule={this.state.schedule}
                    collections={collections}
                    environments={environments}
                    isEditDlgOpen={this.state.isEditDlgOpen}
                    records={_.values(this.props.records)}
                    isRendered={this.state.isEditDlgRendered}
                    render={() => this.setState({ ...this.state, isEditDlgRendered: true })}
                    onCancel={() => this.setState({ ...this.state, isEditDlgOpen: false })}
                    onOk={schedule => this.saveSchedule(schedule)}
                /> */}
            </div>
        );
    }
}

export default StressList;