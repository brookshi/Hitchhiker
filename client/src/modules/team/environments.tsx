import React from 'react';
import { Table } from 'antd';
import { DtoResEnvironment } from '../../../../api/interfaces/dto_res';

interface EnvironmentsProps {

    environments: DtoResEnvironment[];
}

interface EnvironmentsState { }

class EnvironmentTable extends Table<DtoResEnvironment> { }

class EnvironmentColumn extends Table.Column<DtoResEnvironment> { }

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
                    />
                    <EnvironmentColumn
                        title="Action"
                        key="action"
                        width={200}
                        render={(text, record) => (
                            <span>
                                <a href="#">Delete</a>-
                                <a href="#">Duplicate</a>-
                                <a href="#">Edit</a>
                            </span>
                        )}
                    />
                </EnvironmentTable>
            </div>
        );
    }
}

export default Environments;
