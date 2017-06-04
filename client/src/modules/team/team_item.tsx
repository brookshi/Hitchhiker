import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoTeam } from '../../../../api/interfaces/dto_team';

interface TeamItemProps {

    team: DtoTeam;

    isOwner: boolean;

    disbandTeam();

    quitTeam();

    onNameChanged(name: string);
}

interface TeamItemState { }

class TeamItem extends React.Component<TeamItemProps, TeamItemState> {

    private itemWithMenu: ItemWithMenu;

    constructor(props: TeamItemProps) {
        super(props);
    }

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                {
                    this.props.isOwner ? (
                        <Menu.Item key="edit">
                            <Icon type="edit" /> Rename
                        </Menu.Item>
                    ) : ''
                }
                <Menu.Item key="delete">
                    <Icon type="delete" /> {this.props.isOwner ? 'Disband' : 'Quit'}
                </Menu.Item>
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => {
        confirmDlg(
            'team',
            () => this.props.isOwner ? this.props.disbandTeam() : this.props.quitTeam(),
            this.props.isOwner ? 'disband' : 'quit',
            this.props.team.name
        );
    }

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    public render() {
        const { team, isOwner } = this.props;
        const { name, members } = team;
        const count = members ? members.length : 0;

        return (
            <div>
                {isOwner ? <div className="team-item-own" /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={this.props.onNameChanged}
                    icon={<Icon className="c-icon" type="team" />}
                    name={name}
                    disableMenu={team.isMe}
                    subName={<div>{`${count} member${count > 1 ? 's' : ''}`}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default TeamItem;