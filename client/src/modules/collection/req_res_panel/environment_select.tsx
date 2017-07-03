import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Button, Tooltip, Select } from 'antd';
import { DtoEnvironment } from '../../../../../api/interfaces/dto_environment';
import { noEnvironment } from '../../../common/constants';
import { getProjectEnvs, getActiveEnvId, getActiveRecordProjectId } from './selector';
import { actionCreator } from '../../../action/index';
import { AddTabType } from '../../../action/record';
import { SwitchEnvType, EditEnvType } from '../../../action/project';

const Option = Select.Option;

interface EnvironmentSelectStateProps {

    envs: DtoEnvironment[];

    activeEnvId: string;

    activeRecordProjectId: string;
}

interface EnvironmentSelectDispatchProps {

    addTab();

    switchEnv(projectId: string, envId: string);

    editEnv(projectId: string, envId: string);
}

type EnvironmentSelectProps = EnvironmentSelectStateProps & EnvironmentSelectDispatchProps;

interface EnvironmentSelectState { }

class EnvironmentSelect extends React.Component<EnvironmentSelectProps, EnvironmentSelectState> {

    private onEnvChanged = (value) => {
        this.props.switchEnv(this.props.activeRecordProjectId, value);
    }

    private editEnv = () => {
        this.props.editEnv(this.props.activeRecordProjectId, this.props.activeEnvId);
    }

    public render() {

        const { envs, activeEnvId } = this.props;

        return (
            <div>
                <Tooltip mouseEnterDelay={1} placement="left" title="new tab">
                    <Button className="record-add-btn" type="primary" icon="plus" onClick={this.props.addTab} />
                </Tooltip>
                <span className="req-tab-extra-env">
                    <Select value={activeEnvId} className="req-tab-extra-env-select" onChange={(this.onEnvChanged)}>
                        <Option key={noEnvironment} value={noEnvironment}>No Environment</Option>
                        {
                            envs.map(e => (
                                <Option key={e.id} value={e.id}>{e.name}</Option>
                            ))
                        }
                    </Select>
                    <Button className="record-add-btn" icon="edit" onClick={this.editEnv} />
                </span>
            </div>
        );
    }
}

const mapStateToProps = (state: any): EnvironmentSelectStateProps => {
    return {
        envs: getProjectEnvs(state),
        activeEnvId: getActiveEnvId(state),
        activeRecordProjectId: getActiveRecordProjectId(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): EnvironmentSelectDispatchProps => {
    return {
        addTab: () => dispatch(actionCreator(AddTabType)),
        switchEnv: (projectId, envId) => dispatch(actionCreator(SwitchEnvType, { projectId, envId })),
        editEnv: (projectId, envId) => dispatch(actionCreator(EditEnvType, { projectId, envId }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(EnvironmentSelect);