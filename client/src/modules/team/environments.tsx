import React from 'react';
import { Table } from 'antd';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';

interface EnvironmentsProps {

    environments: DtoEnvironment[];
}

interface EnvironmentsState { }

class EnvironmentTable extends Table<DtoEnvironment> { }

class EnvironmentColumn extends Table.Column<DtoEnvironment> { }

class Environments extends React.Component<EnvironmentsProps, EnvironmentsState> {
    public render() {
        return (
            <div>
                <div className="team-title">Environments:
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
                            <a href="#">{text}</a>
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
            </div>
        );
    }
}

export default Environments;
