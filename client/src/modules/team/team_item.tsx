import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon } from 'antd';
import { deleteDlg } from '../../components/confirm_dialog/index';
import { DtoResTeam } from '../../../../api/interfaces/dto_res';

interface TeamItemProps {

    team: DtoResTeam;

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
        deleteDlg('team', () => this.props.isOwner ? this.props.disbandTeam() : this.props.quitTeam());
    }

    public render() {
        const { team, isOwner } = this.props;
        const { name, members } = team;

        return (
            <div>
                {isOwner ? <div className="team-item-own" /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={this.props.onNameChanged}
                    icon={<Icon className="c-icon" type="team" />}
                    name={name}
                    subName={<div>{`${members.length} member${members.length > 1 ? 's' : ''}`}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default TeamItem;