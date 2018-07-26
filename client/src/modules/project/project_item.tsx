import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoProject } from '../../../../api/interfaces/dto_project';
import { GlobalVar } from '../../utils/global_var';
import Msg from '../../locales';
import LocalesString from '../../locales/string';

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

    private itemWithMenu: ItemWithMenu | null;

    constructor(props: ProjectItemProps) {
        super(props);
    }

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                {
                    this.props.isOwner ? (
                        <Menu.Item key="edit">
                            <Icon type="edit" /> {Msg('Common.Rename')}
                        </Menu.Item>
                    ) : ''
                }
                <Menu.Item key="globalFunc">
                    <Icon type="code-o" /> {Msg('Project.GlobalFunction')}
                </Menu.Item>
                <Menu.Item key="projectLibs" disabled={!GlobalVar.instance.enableUploadProjectData}>
                    <Icon type="file" /> {Msg('Project.ProjectLibs')}
                </Menu.Item>
                <Menu.Item key="projectDatas" disabled={!GlobalVar.instance.enableUploadProjectData}>
                    <Icon type="file-text" /> {Msg('Project.ProjectDatas')}
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> {this.props.isOwner ? Msg('Project.Disband') : Msg('Project.Quit')}
                </Menu.Item>
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => {
        confirmDlg(
            LocalesString.get('Project.DeleteProject', { action: this.props.isOwner ? LocalesString.get('Project.Disband') : LocalesString.get('Project.Quit') }),
            () => this.props.isOwner ? this.props.disbandProject() : this.props.quitProject(),
            LocalesString.get('Project.DeleteThisProject', { action: this.props.isOwner ? LocalesString.get('Project.disband') : LocalesString.get('Project.quit'), name: this.props.project.name })
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
                    subName={<div>{Msg('Project.MemberDesc', { count })}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default ProjectItem;