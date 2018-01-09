import React from 'react';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import { SelectParam } from 'antd/lib/menu';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { StringUtil } from '../../utils/string_util';
import { Tooltip, Button, Menu } from 'antd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { NotificationMode } from '../../common/notification_mode';
import { noEnvironment, newStressName } from '../../common/constants';
import * as _ from 'lodash';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import StressEditDialog from './stress_edit_dialog';
import StressItem from './stress_item';

interface StressListProps {

    user: DtoUser;

    activeStress: string;

    currentRunStress: string;

    stresses: DtoStress[];

    collections: _.Dictionary<DtoCollection>;

    environments: _.Dictionary<DtoEnvironment[]>;

    records: _.Dictionary<DtoRecord>;

    createStress(stress: DtoStress);

    selectStress(stressId: string);

    updateStress(stress: DtoStress);

    deleteStress(stressId: string);

    runStress(stressId: string);

    stopStress(stressId: string);
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
        name: newStressName,
        ownerId: user.id,
        collectionId: '',
        environmentId: noEnvironment,
        concurrencyCount: 1,
        repeat: 1,
        qps: 0,
        timeout: 0,
        keepAlive: true,
        requests: [],
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

    private saveStress = (stress) => {
        this.setState({ ...this.state, isEditDlgOpen: false });
        this.state.isCreateNew ? this.props.createStress(stress) : this.props.updateStress(stress);
    }

    private editStress = (stress) => {
        this.setState({
            ...this.state,
            isEditDlgOpen: true,
            isCreateNew: false,
            isEditDlgRendered: false,
            stress: { ...stress, environmentId: stress.environmentId || noEnvironment }
        });
    }

    public render() {
        const { activeStress, currentRunStress, stresses, collections, environments, user, deleteStress, runStress, stopStress } = this.props;
        return (
            <div>
                <div className="small-toolbar">
                    <span>Stresses</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create stress test">
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
                                            stop={() => stopStress(t.id)}
                                            isRunning={currentRunStress === t.id}
                                        />
                                    </Menu.Item>
                                )
                            )
                        }
                    </Menu>
                </PerfectScrollbar>
                <StressEditDialog
                    stress={this.state.stress}
                    collections={collections}
                    environments={environments}
                    isEditDlgOpen={this.state.isEditDlgOpen}
                    records={_.values(this.props.records)}
                    isRendered={this.state.isEditDlgRendered}
                    render={() => this.setState({ ...this.state, isEditDlgRendered: true })}
                    onCancel={() => this.setState({ ...this.state, isEditDlgOpen: false })}
                    onOk={stress => this.saveStress(stress)}
                />
            </div>
        );
    }
}

export default StressList;