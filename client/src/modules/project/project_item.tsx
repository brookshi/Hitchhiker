import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoProject } from '../../../../api/interfaces/dto_project';

interface ProjectItemProps {

    project: DtoProject;

    isOwner: boolean;

    disbandProject();

    quitProject();

    onNameChanged(name: string);

    editGlobalFunc(projectId: string);

    viewProjectLibs(projectId: string);

    viewProjectDatas(projectId: string);
}

interface ProjectItemState { }

class ProjectItem extends React.Component<ProjectItemProps, ProjectItemState> {

    private itemWithMenu: ItemWithMenu;

    constructor(props: ProjectItemProps) {
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
                <Menu.Item key="globalFunc">
                    <Icon type="code-o" /> Global function
                </Menu.Item>
                <Menu.Item key="projectLibs">
                    <Icon type="file" /> Project libs
                </Menu.Item>
                <Menu.Item key="projectDatas">
                    <Icon type="file-text" /> Project datas
                </Menu.Item>
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
            'project',
            () => this.props.isOwner ? this.props.disbandProject() : this.props.quitProject(),
            this.props.isOwner ? 'disband' : 'quit',
            this.props.project.name
        );
    }

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    globalFunc = () => {
        this.props.editGlobalFunc(this.props.project.id);
    }

    projectLibs = () => {
        this.props.viewProjectLibs(this.props.project.id);
    }

    projectDatas = () => {
        this.props.viewProjectDatas(this.props.project.id);
    }

    public render() {
        const { project, isOwner } = this.props;
        const { name, members } = project;
        const count = members ? members.length : 0;

        return (
            <div>
                {isOwner ? <div className="item-own" /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={this.props.onNameChanged}
                    icon={<Icon className="c-icon" type="solution" />}
                    name={name}
                    disableMenu={project.isMe}
                    subName={<div>{`${count} member${count > 1 ? 's' : ''}`}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default ProjectItem;