import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Button, Tooltip, Select, Dropdown, Menu, message } from 'antd';
import { noEnvironment, newRequestName, allParameter } from '../../../common/constants';
import { getProjectEnvsSelector, getActiveEnvIdSelector, getActiveRecordProjectIdSelector } from './selector';
import { actionCreator } from '../../../action/index';
import { AddTabType } from '../../../action/record';
import { SwitchEnvType, EditEnvType } from '../../../action/project';
import { State } from '../../../state/index';
import ScriptDialog from '../../../components/script_dialog';
import { RecordState } from '../../../state/collection';
import { CurlImport } from '../../../utils/curl_import';
import { ConflictType } from '../../../common/conflict_type';

const Option = Select.Option;

interface EnvironmentSelectStateProps {

    envs: Array<{ id: string, name: string }>;

    activeEnvId: string;

    activeRecordProjectId: string;
}

interface EnvironmentSelectDispatchProps {

    addTab(newRequestState?: RecordState);

    switchEnv(projectId: string, envId: string);

    editEnv(projectId: string, envId: string);
}

type EnvironmentSelectProps = EnvironmentSelectStateProps & EnvironmentSelectDispatchProps;

interface EnvironmentSelectState {

    isImportDlgOpen?: boolean;
}

class EnvironmentSelect extends React.Component<EnvironmentSelectProps, EnvironmentSelectState> {

    constructor(props: EnvironmentSelectProps) {
        super(props);
        this.state = {
            isImportDlgOpen: false
        };
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    private tabMenu = (
        <Menu onClick={this.onClickMenu}>
            <Menu.Item key="importCurl">new Request from cUrl</Menu.Item>
        </Menu>
    );

    importCurl = () => {
        this.setState({ ...this.state, isImportDlgOpen: true });
    }

    private onEnvChanged = (value) => {
        this.props.switchEnv(this.props.activeRecordProjectId, value);
    }

    private editEnv = () => {
        this.props.editEnv(this.props.activeRecordProjectId, this.props.activeEnvId);
    }

    private get commonPreScriptDialog() {
        const { isImportDlgOpen } = this.state;
        return (
            <ScriptDialog
                title="New request from cURL"
                isOpen={!!isImportDlgOpen}
                editorType="text"
                onOk={value => {
                    try {
                        const record = CurlImport.do(value);
                        if (!record) {
                            message.warning(`parse cURL failed.`);
                            return;
                        }
                        const recordState: RecordState = {
                            name: record.name || newRequestName,
                            record,
                            isChanged: true,
                            isRequesting: false,
                            parameter: allParameter,
                            conflictType: ConflictType.none
                        };
                        this.props.addTab(recordState);
                        this.setState({ ...this.state, isImportDlgOpen: false });
                    } catch (err) {
                        message.warning(err.toString());
                    }
                } }
                value=""
                onCancel={() => this.setState({ ...this.state, isImportDlgOpen: false })}
                />
        );
    }

    public render() {

        const { envs, activeEnvId } = this.props;

        return (
            <div>
                <Tooltip mouseEnterDelay={1} placement="left" title="new tab">
                    <Button className="record-add-btn" type="primary" icon="plus" onClick={() => this.props.addTab()} />
                </Tooltip>
                <Dropdown overlay={this.tabMenu}>
                    <Button className="record-add-btn" type="primary" icon="ellipsis" />
                </Dropdown>
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
                {
                    this.commonPreScriptDialog
                }
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
        addTab: (newRequestState) => dispatch(actionCreator(AddTabType, newRequestState)),
        switchEnv: (projectId, envId) => dispatch(actionCreator(SwitchEnvType, { projectId, envId })),
        editEnv: (projectId, envId) => dispatch(actionCreator(EditEnvType, { projectId, envId }))
    };
};

export default connect(
    makeMapStateToProps(),
    mapDispatchToProps,
)(EnvironmentSelect);