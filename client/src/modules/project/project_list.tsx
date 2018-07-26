import React from 'react';
import { Menu, Tooltip, Button } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import ProjectItem from './project_item';
import ProjectDataDialog from './project_data_dialog';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DtoProject } from '../../../../api/src/interfaces/dto_project';
import { StringUtil } from '../../utils/string_util';
import { DtoUser } from '../../../../api/src/interfaces/dto_user';
import { ProjectFiles } from '../../../../api/src/interfaces/dto_project_data';
import { newProjectName } from '../../common/constants';
import ScriptDialog from '../../components/script_dialog';
import { ProjectFileTypes, ProjectFileType } from '../../common/custom_type';
import * as _ from 'lodash';
import Msg from '../../locales';

interface ProjectListProps {

    user: DtoUser;

    projects: DtoProject[];

    activeProject: string;

    projectFiles: ProjectFiles;

    disbandProject(project: DtoProject);

    quitProject(project: DtoProject);

    updateProject(project: DtoProject);

    createProject(project: DtoProject);

    selectProject(projectId: string);

    saveGlobalFunc(projectId: string, globalFunc: string);

    deleteFile(pid: string, name: string, type: ProjectFileType);

    addFile(pid: string, name: string, path: string, type: ProjectFileType);
}

interface ProjectListState {

    isGlobalFuncDlgOpen: boolean;

    isProjectFileDlgOpen: boolean;

    currentOperatedProject?: string;

    projectFileType: ProjectFileType;
}

const createDefaultProject = (user: DtoUser) => {
    return {
        id: StringUtil.generateUID(),
        name: newProjectName(),
        owner: user,
        members: [user]
    };
};

class ProjectList extends React.Component<ProjectListProps, ProjectListState> {

    private currentNewProject: DtoProject | undefined;
    private projectRefs: _.Dictionary<ProjectItem | null> = {};

    constructor(props: ProjectListProps) {
        super(props);
        this.state = {
            isGlobalFuncDlgOpen: false,
            isProjectFileDlgOpen: false,
            projectFileType: ProjectFileTypes.data
        };
    }

    componentDidUpdate(prevProps: ProjectListProps, prevState: ProjectListState) {
        if (this.currentNewProject) {
            const projectRef = this.projectRefs[this.currentNewProject.id];
            if (projectRef) {
                projectRef.edit();
                this.currentNewProject = undefined;
            }
        }
    }

    private getProject = (id: string) => {
        return this.props.projects.find(p => p.id === id);
    }

    private getProjectGlobalFunc = (id: string) => {
        const project = this.getProject(id);
        return project ? project.globalFunction || '' : '';
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.selectProject(param.item.props.data.id);
    }

    private changeProjectName = (name: string, project: DtoProject) => {
        if (name.trim() !== '' && name !== project.name) {
            project.name = name;
            this.props.updateProject(project);
        }
    }

    private createProject = () => {
        const newProject = createDefaultProject(this.props.user);
        this.currentNewProject = newProject;
        this.props.createProject(newProject);
    }

    private saveGlobalFunc = (code: string) => {
        const { currentOperatedProject } = this.state;
        if (!currentOperatedProject) {
            return;
        }
        this.props.saveGlobalFunc(currentOperatedProject, code);
        this.setState({ ...this.state, isGlobalFuncDlgOpen: false });
    }

    private get globalFuncDialog() {
        const { isGlobalFuncDlgOpen, currentOperatedProject } = this.state;
        const project = this.getProject(currentOperatedProject || '');
        return (
            <ScriptDialog
                title={Msg('Project.GlobalFuncOfTest', { name: project ? project.name + ': ' : '' })}
                isOpen={isGlobalFuncDlgOpen}
                onOk={this.saveGlobalFunc}
                value={this.getProjectGlobalFunc(currentOperatedProject || '')}
                onCancel={() => this.setState({ ...this.state, isGlobalFuncDlgOpen: false })}
            />
        );
    }

    private get ProjectLibDialog() {
        const { isProjectFileDlgOpen, currentOperatedProject, projectFileType } = this.state;
        return (
            <ProjectDataDialog
                projectId={currentOperatedProject || ''}
                type={projectFileType}
                projectFiles={this.props.projectFiles}
                isDlgOpen={isProjectFileDlgOpen}
                title={Msg(projectFileType === ProjectFileTypes.lib ? 'Project.ProjectLibs' : 'Project.ProjectDatas')}
                deleteFile={(pid, name, type) => this.props.deleteFile(pid, name, type)}
                addFile={(pid, name, path, type) => this.props.addFile(pid, name, path, type)}
                onClose={() => this.setState({ ...this.state, isProjectFileDlgOpen: false })}
            />
        );
    }

    public render() {
        return (
            <div>
                <div className="small-toolbar">
                    <span>{Msg('Project.Projects')}</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title={Msg('Project.CreateProject')}>
                        <Button className="icon-btn project-add-btn" type="primary" icon="file-add" onClick={this.createProject} />
                    </Tooltip>
                </div>
                <PerfectScrollbar>
                    <Menu
                        className="project-list"
                        mode="inline"
                        inlineIndent={0}
                        selectedKeys={[this.props.activeProject]}
                        onSelect={this.onSelectChanged}
                    >
                        {
                            this.props.projects.map(t =>
                                (
                                    <Menu.Item key={t.id} data={t}>
                                        <ProjectItem
                                            ref={ele => this.projectRefs[t.id] = ele}
                                            project={t}
                                            isOwner={t.owner.id === this.props.user.id}
                                            disbandProject={() => this.props.disbandProject(t)}
                                            quitProject={() => this.props.quitProject(t)}
                                            onNameChanged={name => this.changeProjectName(name, t)}
                                            editGlobalFunc={id => this.setState({
                                                ...this.state,
                                                currentOperatedProject: id,
                                                isGlobalFuncDlgOpen: true
                                            })}
                                            viewProjectLibs={id => this.setState({ ...this.state, currentOperatedProject: id, isProjectFileDlgOpen: true, projectFileType: ProjectFileTypes.lib })}
                                            viewProjectDatas={id => this.setState({ ...this.state, currentOperatedProject: id, isProjectFileDlgOpen: true, projectFileType: ProjectFileTypes.data })}
                                        />
                                    </Menu.Item>
                                )
                            )
                        }
                    </Menu>
                </PerfectScrollbar>
                {this.globalFuncDialog}
                {this.ProjectLibDialog}
            </div>
        );
    }
}

export default ProjectList;