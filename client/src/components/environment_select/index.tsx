import React from 'react';
import { connect } from 'react-redux';
import { Button, Tooltip, Select, Dropdown, Menu, message } from 'antd';
import { noEnvironment, newRequestName, allParameter } from '../../common/constants';
import { actionCreator } from '../../action/index';
import { AddTabType } from '../../action/record';
import { EditEnvType } from '../../action/project';
import { State } from '../../state/index';
import ScriptDialog from '../script_dialog';
import { RecordState } from '../../state/collection';
import { CurlImport } from '../../utils/curl_import';
import { ConflictType } from '../../common/conflict_type';
import Msg from '../../locales';
import { CloseAction } from '../../common/custom_type';
import { BatchCloseType } from '../../action/ui';
import LocalesString from '../../locales/string';
import './style/index.less';

const Option = Select.Option;

interface OwnProps {

    envs: Array<{ id: string, name: string }>;

    activeEnvId: string;

    activeRecordProjectId: string;

    switchEnvType: string;

    onlyEnvSelect?: boolean;

    className?: string;
}

interface EnvironmentSelectStateProps extends OwnProps {

    activeTab: string;
}

interface EnvironmentSelectDispatchProps {

    addTab(newRequestState?: RecordState);

    switchEnv(type: string, projectId: string, envId: string);

    editEnv(projectId: string, envId: string);

    setCloseAction(closeAction: CloseAction, activeTab: string);
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
            <Menu.Item key="importCurl">{Msg('Collection.NewRequestFromcURL')}</Menu.Item>
            <Menu.Item key="closeExceptActived">{Msg('Collection.CloseExceptActived')}</Menu.Item>
            <Menu.Item key="closeSaved">{Msg('Collection.CloseSaved')}</Menu.Item>
            <Menu.Item key="closeAll">{Msg('Collection.CloseAll')}</Menu.Item>
        </Menu>
    );

    importCurl = () => {
        this.setState({ ...this.state, isImportDlgOpen: true });
    }

    closeExceptActived = () => {
        this.closeTabs(CloseAction.exceptActived);
    }

    closeSaved = () => {
        this.closeTabs(CloseAction.saved);
    }

    closeAll = () => {
        this.closeTabs(CloseAction.all);
    }

    private closeTabs = (mode: CloseAction) => {
        this.props.setCloseAction(mode, this.props.activeTab);
    }

    private onEnvChanged = (value) => {
        this.props.switchEnv(this.props.switchEnvType, this.props.activeRecordProjectId, value);
    }

    private editEnv = () => {
        this.props.editEnv(this.props.activeRecordProjectId, this.props.activeEnvId);
    }

    private get commonPreScriptDialog() {
        const { isImportDlgOpen } = this.state;
        return (
            <ScriptDialog
                title={Msg('Collection.NewRequestFromcURL')}
                isOpen={!!isImportDlgOpen}
                editorType="text"
                onOk={value => {
                    try {
                        const record = CurlImport.do(value);
                        if (!record) {
                            message.warning(LocalesString.get('Collection.ParsecURLFailed'));
                            return;
                        }
                        const recordState: RecordState = {
                            name: record.name || newRequestName(),
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
                }}
                value=""
                onCancel={() => this.setState({ ...this.state, isImportDlgOpen: false })}
            />
        );
    }

    public render() {

        const { envs, activeEnvId, onlyEnvSelect, className } = this.props;
        const style = onlyEnvSelect ? { border: 0 } : {};

        return (
            <div className={className}>
                {
                    !onlyEnvSelect ? (
                        <span>
                            <Tooltip mouseEnterDelay={1} placement="left" title="new tab">
                                <Button className="record-add-btn" type="primary" icon="plus" onClick={() => this.props.addTab()} />
                            </Tooltip>
                            <Dropdown overlay={this.tabMenu}>
                                <Button className="record-add-btn" type="primary" icon="ellipsis" />
                            </Dropdown>
                        </span>
                    ) : ''
                }
                <span className="req-tab-extra-env" style={style}>
                    <Select value={activeEnvId} className="req-tab-extra-env-select" onChange={(this.onEnvChanged)}>
                        <Option key={noEnvironment} value={noEnvironment}>No Environment</Option>
                        {
                            envs.map(e => (
                                <Option key={e.id} value={e.id}>{e.name}</Option>
                            ))
                        }
                    </Select>
                    {onlyEnvSelect ? '' : <Button className="record-add-btn" icon="edit" onClick={this.editEnv} />}
                </span>
                {
                    onlyEnvSelect ? '' : this.commonPreScriptDialog
                }
            </div>
        );
    }
}

const makeMapStateToProps = () => {
    const mapStateToProps: (state: State, ownProps: OwnProps) => EnvironmentSelectStateProps = (state, ownProps) => {
        return {
            activeTab: state.displayRecordsState.activeKey,
            ...ownProps
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: any): EnvironmentSelectDispatchProps => {
    return {
        addTab: (newRequestState) => dispatch(actionCreator(AddTabType, newRequestState)),
        switchEnv: (type, projectId, envId) => dispatch(actionCreator(type, { projectId, envId })),
        editEnv: (projectId, envId) => dispatch(actionCreator(EditEnvType, { projectId, envId })),
        setCloseAction: (closeAction, activedTab) => dispatch(actionCreator(BatchCloseType, { closeAction, activedTab }))
    };
};

export default connect(
    makeMapStateToProps(),
    mapDispatchToProps,
)(EnvironmentSelect) as any;