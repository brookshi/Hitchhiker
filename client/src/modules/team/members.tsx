import React from 'react';
import { Table, Button, Icon } from 'antd';

interface Member {

    email: string;

    name: string;

    isOwner: boolean;
}

interface MembersProps {

    isOwner: boolean;

    members: Member[];
}

interface MembersState { }

class MemberTable extends Table<Member> { }

class MemberColumn extends Table.Column<Member> { }

class Members extends React.Component<MembersProps, MembersState> {
    public render() {
        return (
            <div>
                <div className="team-title">Members:
                    <span className="team-members-invite-btn">
                        <Button type="primary" size="small" icon="user-add">Invite</Button>
                    </span>
                </div>
                <MemberTable
                    className="team-table team-members"
                    bordered={true}
                    size="middle"
                    rowKey="email"
                    dataSource={this.props.members}
                    pagination={false}
                >
                    <MemberColumn
                        title="Name"
                        dataIndex="name"
                        key="name"
                    />
                    <MemberColumn
                        title="Email"
                        dataIndex="email"
                        key="email"
                    />
                    <MemberColumn
                        title="IsOwner"
                        dataIndex="isOwner"
                        key="isOwner"
                        width={200}
                        render={(text, record) => (<Icon type={record.isOwner ? 'check' : ''} />)}
                    />
                    {
                        this.props.isOwner ? (
                            <MemberColumn
                                title="Action"
                                key="action"
                                width={200}
                                render={(text, record) => (
                                    <span>
                                        <a href="#">Delete</a>
                                    </span>
                                )}
                            />
                        ) : ''
                    }
                </MemberTable>
            </div>
        );
    }
}

export default Members;
