import React from 'react';
import { Table, Modal, Input, Button } from 'antd';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import KeyValueComponent from '../../components/key_value';
import { KeyValueEditType, KeyValueEditMode } from '../../common/custom_type';
import { DtoHeader } from '../../../../api/interfaces/dto_header';
import { StringUtil } from '../../utils/string_util';
import { DtoVariable } from '../../../../api/interfaces/dto_variable';

const getDefaultEnv = (teamId: string) => { return { id: StringUtil.generateUID(), name: '', variables: [], teamId }; };

interface EnvironmentsProps {

    activeTeam: string;

    environments: DtoEnvironment[];

    createEnv(env: DtoEnvironment);

    updateEnv(env: DtoEnvironment);
}

interface EnvironmentsState {

    isEditEnvDlgOpen: boolean;

    variablesEditMode: KeyValueEditMode;

    environment: DtoEnvironment;

    isNew: boolean;
}

class EnvironmentTable extends Table<DtoEnvironment> { }

class EnvironmentColumn extends Table.Column<DtoEnvironment> { }

class Environments extends React.Component<EnvironmentsProps, EnvironmentsState> {

    private envNameInput: Input;

    constructor(props: EnvironmentsProps) {
        super(props);
        this.state = {
            isNew: true,
            isEditEnvDlgOpen: false,
            variablesEditMode: KeyValueEditType.keyValueEdit,
            environment: getDefaultEnv(props.activeTeam)
        };
    }

    private saveEnvironment = () => {
        if (!this.state.environment.name) {
            return;
        }

        this.state.isNew ? this.props.createEnv(this.state.environment) : this.props.updateEnv(this.state.environment);
        this.setState({ ...this.state, isEditEnvDlgOpen: false, environment: getDefaultEnv(this.props.activeTeam) });
    }

    private onHeadersChanged = (variables: DtoHeader[]) => {
        this.setState({ ...this.state, environment: { ...this.state.environment, variables: variables as DtoVariable[] } });
    }

    private onEnvNameChanged = (envName: string) => {
        this.setState({ ...this.state, environment: { ...this.state.environment, name: envName } });
    }

    private editEnv = (env: DtoEnvironment) => {
        this.setState({
            ...this.state,
            environment: env,
            isNew: false,
            isEditEnvDlgOpen: true
        }, () => this.envNameInput && this.envNameInput.focus());
    }

    private onHeaderModeChanged = () => {
        this.setState({
            ...this.state,
            variablesEditMode: KeyValueEditType.getReverseMode(this.state.variablesEditMode)
        });
    }

    public render() {
        return (
            <div>
                <div className="team-title">
                    Environments:
                </div>
                <EnvironmentTable
                    className="team-table team-environments"
                    bordered={true}
                    size="middle"
                    rowKey="id"
                    dataSource={this.props.environments}
                    pagination={false}
                >
                    <EnvironmentColumn
                        title="Environment"
                        dataIndex="name"
                        key="name"
                        render={(text, record) => (
                            <a href="#" onClick={() => this.editEnv(record)}>{text}</a>
                        )}
                    />
                    <EnvironmentColumn
                        title="Action"
                        key="action"
                        width={240}
                        render={(text, record) => (
                            <span>
                                <a href="#">Edit</a> - <span />
                                <a href="#">Duplicate</a> - <span />
                                <a href="#">Delete</a>
                            </span>
                        )}
                    />
                </EnvironmentTable>
                <Modal
                    title="Edit Environment"
                    visible={this.state.isEditEnvDlgOpen}
                    onCancel={() => this.setState({ ...this.state, isEditEnvDlgOpen: false })}
                    okText="Save"
                    cancelText="Cancel"
                    onOk={this.saveEnvironment}
                    width={600}
                >
                    <div className="env-variable-tip">
                        {'Variables can be used in Url, Headers, Body with format {{key}}, when send request, {{key}} will be replaced with value. For example, you can use different host for environment QA, Staging, Live by using variables.'}
                    </div>
                    <div style={{ marginBottom: '8px' }}>Environment Name:</div>
                    <Input
                        ref={ele => this.envNameInput = ele}
                        style={{ width: '100%' }}
                        value={this.state.environment.name}
                        spellCheck={false}
                        onChange={e => this.onEnvNameChanged(e.currentTarget.value)}
                    />
                    <div className="env-variable-title">
                        <span>Variables:</span>
                        <span className="env-variable-mode-btn">
                            <Button className="tab-extra-button" onClick={this.onHeaderModeChanged}>
                                {KeyValueEditType.getReverseMode(this.state.variablesEditMode)}
                            </Button>
                        </span>
                    </div>
                    <KeyValueComponent
                        mode={this.state.variablesEditMode}
                        headers={this.state.environment.variables}
                        onHeadersChanged={this.onHeadersChanged}
                    />
                </Modal>
            </div>
        );
    }
}

export default Environments;
