import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Button, Tooltip, Select } from 'antd';
import { noEnvironment } from '../../../common/constants';
import { getProjectEnvsSelector, getActiveEnvIdSelector, getActiveRecordProjectIdSelector } from './selector';
import { actionCreator } from '../../../action/index';
import { AddTabType } from '../../../action/record';
import { SwitchEnvType, EditEnvType } from '../../../action/project';
import { State } from '../../../state/index';

const Option = Select.Option;

interface EnvironmentSelectStateProps {

    envs: Array<{ id: string, name: string }>;

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

const makeMapStateToProps = () => {
    const getProjectEnvs = getProjectEnvsSelector();
    const getActiveEnvId = getActiveEnvIdSelector();
    const getActiveRecordProjectId = getActiveRecordProjectIdSelector();
    const mapStateToProps: (state: State) => EnvironmentSelectStateProps = state => {
        return {
            envs: getProjectEnvs(state),
            activeEnvId: getActiveEnvId(state),
            activeRecordProjectId: getActiveRecordProjectId(state)
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): EnvironmentSelectDispatchProps => {
    return {
        addTab: () => dispatch(actionCreator(AddTabType)),
        switchEnv: (projectId, envId) => dispatch(actionCreator(SwitchEnvType, { projectId, envId })),
        editEnv: (projectId, envId) => dispatch(actionCreator(EditEnvType, { projectId, envId }))
    };
};

export default connect(
    makeMapStateToProps(),
    mapDispatchToProps,
)(EnvironmentSelect);