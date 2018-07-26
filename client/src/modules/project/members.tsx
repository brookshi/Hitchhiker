import React from 'react';
import { Table, Button, Icon, Modal, Select, message } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { StringUtil } from '../../utils/string_util';
import EditableCell from '../../components/editable_cell';
import * as ReactDOM from 'react-dom';
import Msg from '../../locales';
import LocalesString from '../../locales/string';

interface Member {

    id: string;

    email: string;

    name: string;

    localhostMappingId: string;

    localhost: string;

    isOwner: boolean;
}

interface MembersProps {

    activeProject: string;

    isOwner: boolean;

    members: Member[];

    removeUser(projectId: string, userId: string);

    invite(projectId: string, emails: string[]);

    changeLocalhost(id: string, projectId: string, userId: string, ip: string);
}

interface MembersState {

    isInviteDlgOpen: boolean;

    inviteEmails: string[];
}

class MemberTable extends Table<Member> { }

class MemberColumn extends Table.Column<Member> { }

class Members extends React.Component<MembersProps, MembersState> {

    private inviteEmailInput: Select | null;

    constructor(props: MembersProps) {
        super(props);
        this.state = {
            isInviteDlgOpen: false,
            inviteEmails: []
        };
    }

    private removeUser = (member: Member) => {
        confirmDlg(
            LocalesString.get('Project.RemoveUser'),
            () => this.props.removeUser(this.props.activeProject, member.id),
            LocalesString.get('Project.RemoveThisUser')
        );
    }

    private clickInviteBtn = () => {
        this.setState({ ...this.state, isInviteDlgOpen: true }, () => this.inviteEmailInputDom && this.inviteEmailInputDom.focus());
    }

    private get inviteEmailInputDom() {
        if (this.inviteEmailInput) {
            return ReactDOM.findDOMNode(this.inviteEmailInput).getElementsByTagName('input')[0] as HTMLInputElement;
        }
        return undefined;
    }

    private inviteMember = () => {
        const invite = () => {
            const result = StringUtil.checkEmails(this.state.inviteEmails);
            if (!result.success) {
                message.warning(result.message, 3);
                return;
            }
            this.props.invite(this.props.activeProject, this.state.inviteEmails);
            this.setState({ ...this.state, isInviteDlgOpen: false });
        };
        if (this.inviteEmailInputDom && !!this.inviteEmailInputDom.defaultValue) {
            this.setState({ ...this.state, inviteEmails: [...this.state.inviteEmails, this.inviteEmailInputDom.defaultValue] }, invite);
        } else {
            invite();
        }
    }

    private inviteEmailsChanged = (value) => {
        this.setState({ ...this.state, inviteEmails: value });
    }

    private changeLocalhost = (id: string, userId: string, oldIp: string, newIp: string) => {
        if (!!id && newIp === oldIp) {
            return;
        }
        const { changeLocalhost, activeProject } = this.props;
        changeLocalhost(id, activeProject, userId, newIp);
    }

    public render() {
        return (
            <div>
                <div className="project-title">{Msg('Project.Members')}
                    <Button
                        className="project-create-btn"
                        type="primary"
                        size="small"
                        icon="user-add"
                        ghost={true}
                        onClick={this.clickInviteBtn}
                    >
                        {Msg('Project.InviteMembers')}
                    </Button>
                </div>
                <MemberTable
                    className="project-table project-members"
                    bordered={true}
                    size="middle"
                    rowKey="email"
                    dataSource={this.props.members}
                    pagination={false}
                >
                    <MemberColumn
                        title={Msg('Project.Name')}
                        dataIndex="name"
                        key="name"
                    />
                    <MemberColumn
                        title={Msg('Project.Email')}
                        dataIndex="email"
                        key="email"
                    />
                    <MemberColumn
                        title={Msg('Project.Localhost')}
                        dataIndex="localhost"
                        key="localhost"
                        width={170}
                        render={
                            (text, record, index) => (
                                <EditableCell
                                    content={text}
                                    onChange={(newText) => this.changeLocalhost(record.localhostMappingId, record.id, text, newText)}
                                />
                            )
                        }
                    />
                    <MemberColumn
                        title={Msg('Project.IsOwner')}
                        dataIndex="isOwner"
                        key="isOwner"
                        width={120}
                        render={(text, record) => (<Icon type={record.isOwner ? 'check' : ''} />)}
                    />
                    {
                        this.props.isOwner ? (
                            <MemberColumn
                                title={Msg('Project.Action')}
                                key="action"
                                width={240}
                                render={(text, record) =>
                                    record.isOwner ? '' :
                                        (
                                            <span>
                                                <a
                                                    href="#"
                                                    onClick={() => this.removeUser(record)}
                                                >
                                                    {Msg('Common.Delete')}
                                                </a>
                                            </span>
                                        )
                                }
                            />
                        ) : ''
                    }
                </MemberTable>
                <Modal
                    title={Msg('Project.InviteMembers')}
                    visible={this.state.isInviteDlgOpen}
                    onCancel={() => this.setState({ ...this.state, isInviteDlgOpen: false })}
                    onOk={this.inviteMember}
                >
                    <div style={{ marginBottom: '8px' }}>{Msg('Project.InviterDesc')}</div>
                    <Select
                        ref={ele => this.inviteEmailInput = ele}
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="sample@hitchhiker.com;"
                        value={this.state.inviteEmails}
                        onChange={this.inviteEmailsChanged}
                        tokenSeparators={[';']}
                        dropdownStyle={{ display: 'none' }}
                    />
                </Modal>
            </div>
        );
    }
}

export default Members;
