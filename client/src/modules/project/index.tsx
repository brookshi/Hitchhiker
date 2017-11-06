import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Layout } from 'antd';
import Splitter from '../../components/splitter';
import ProjectList from './project_list';
import Members from './members';
import Environments from './environments';
import { DtoProject } from '../../../../api/interfaces/dto_project';
import { State } from '../../state';
import { actionCreator } from '../../action';
import { UpdateLeftPanelType, ResizeLeftPanelType } from '../../action/ui';
import { EditEnvType, DisbandProjectType, QuitProjectType, SaveProjectType, RemoveUserType, InviteMemberType, SaveEnvironmentType, DelEnvironmentType, ActiveProjectType, EditEnvCompletedType, SaveLocalhostMappingType, SaveGlobalFunctionType, DeleteProjectFileType } from '../../action/project';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import * as _ from 'lodash';
import './style/index.less';
import { localhost } from '../../common/constants';
import { StringUtil } from '../../utils/string_util';
import { ProjectFileType } from '../../common/custom_type';
import { ProjectFiles } from '../../../../api/interfaces/dto_project_data';

const { Content, Sider } = Layout;

interface ProjectStateProps {

    activeProject: string;

    collapsed: boolean;

    leftPanelWidth: number;

    user: DtoUser;

    projects: DtoProject[];

    environments: _.Dictionary<DtoEnvironment[]>;

    isEditEnvDlgOpen: boolean;

    editedEnvironment?: string;

    projectFiles: ProjectFiles;
}

interface ProjectDispatchProps {

    resizeLeftPanel(width: number);

    collapsedLeftPanel(collapsed: boolean);

    disbandProject(project: DtoProject);

    quitProject(project: DtoProject);

    updateProject(project: DtoProject);

    createProject(project: DtoProject);

    selectProject(projectId: string);

    removeUser(projectId: string, userId: string);

    invite(projectId: string, emails: string[]);

    createEnv(env: DtoEnvironment);

    updateEnv(env: DtoEnvironment);

    delEnv(envId: string, projectId: string);

    editEnvCompleted();

    editEnv(projectId: string, envId: string);

    changeLocalhost(id: string, projectId: string, userId: string, ip: string);

    saveGlobalFunc(projectId: string, globalFunc: string);

    deleteFile(pid: string, name: string, type: ProjectFileType);
}

type ProjectProps = ProjectStateProps & ProjectDispatchProps;

interface ProjectState { }

class Project extends React.Component<ProjectProps, ProjectState> {

    constructor(props: ProjectProps) {
        super(props);
    }

    getSelectedProject = () => {
        return this.props.projects.find(t => t.id === this.props.activeProject);
    }

    isSelectProjectOwn = () => {
        const project = this.getSelectedProject();
        return !!project && !!project.owner && project.owner.id === this.props.user.id;
    }

    getSelectProjectMembers = () => {
        const project = this.getSelectedProject();
        if (!project || !project.members) {
            return [];
        }
        const localhostDict = _.keyBy(project.localhosts || [], 'userId');
        return _.sortBy(project.members.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email,
            localhostMappingId: localhostDict[t.id] ? localhostDict[t.id].id || '' : '',
            localhost: localhostDict[t.id] ? localhostDict[t.id].ip || localhost : localhost,
            isOwner: t.id === project.owner.id
        })), m => m.name);
    }

    getSelectProjectEnvironments = () => {
        const env = this.props.environments[this.props.activeProject];
        return _.sortBy(env, e => e.name);
    }

    public render() {
        const project = this.getSelectedProject();
        const { user, collapsed, collapsedLeftPanel, projects, leftPanelWidth, disbandProject, quitProject, selectProject, updateProject, createProject, removeUser, invite, createEnv, updateEnv, delEnv, isEditEnvDlgOpen, editedEnvironment, activeProject, editEnvCompleted, editEnv, changeLocalhost, saveGlobalFunc, deleteFile, projectFiles } = this.props;

        return (
            <Layout className="main-panel">
                <Sider
                    className="main-sider"
                    style={{ minWidth: collapsed ? 0 : leftPanelWidth }}
                    collapsible={true}
                    collapsedWidth="0.1"
                    collapsed={collapsed}
                    onCollapse={collapsedLeftPanel}>
                    <ProjectList
                        activeProject={activeProject}
                        selectProject={(id) => selectProject(id)}
                        user={user}
                        projects={projects}
                        disbandProject={disbandProject}
                        quitProject={quitProject}
                        updateProject={updateProject}
                        createProject={createProject}
                        saveGlobalFunc={saveGlobalFunc}
                        deleteFile={deleteFile}
                        projectFiles={projectFiles}
                    />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content className="project-right-panel">
                    {
                        project && project.isMe ? '' : (
                            <div>
                                <Members
                                    activeProject={activeProject}
                                    isOwner={this.isSelectProjectOwn()}
                                    members={this.getSelectProjectMembers()}
                                    removeUser={removeUser}
                                    changeLocalhost={changeLocalhost}
                                    invite={invite}
                                />
                                <div style={{ height: 12 }} />
                            </div>
                        )
                    }
                    <Environments
                        environments={this.getSelectProjectEnvironments()}
                        createEnv={createEnv}
                        updateEnv={updateEnv}
                        activeProject={activeProject}
                        delEnv={envId => delEnv(envId, activeProject)}
                        isEditEnvDlgOpen={isEditEnvDlgOpen}
                        editedEnvironment={editedEnvironment}
                        editEnvCompleted={editEnvCompleted}
                        editEnv={editEnv}
                    />
                </Content>
            </Layout>
        );
    }
}

const mapStateToProps = (state: State): ProjectStateProps => {
    const { leftPanelWidth, collapsed } = state.uiState.appUIState;
    const { activeProject, projects } = state.projectState;
    const user = state.userState.userInfo as DtoUser;

    return {
        activeProject,
        leftPanelWidth,
        collapsed,
        user,
        projects: _.chain(projects).values<DtoProject>().sortBy('name').sortBy(t => t.owner.id !== user.id).sortBy(t => t.isMe ? 0 : 1).value(),
        environments: state.environmentState.environments,
        isEditEnvDlgOpen: state.environmentState.isEditEnvDlgOpen,
        editedEnvironment: state.environmentState.editedEnvironment,
        projectFiles: state.projectState.projectFiles
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ProjectDispatchProps => {
    return {
        resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width)),
        collapsedLeftPanel: (collapsed) => dispatch(actionCreator(UpdateLeftPanelType, collapsed)),
        disbandProject: (project) => { dispatch(actionCreator(DisbandProjectType, project)); },
        quitProject: (project) => { dispatch(actionCreator(QuitProjectType, project)); },
        updateProject: (project) => dispatch(actionCreator(SaveProjectType, { isNew: false, project })),
        createProject: (project) => dispatch(actionCreator(SaveProjectType, { isNew: true, project })),
        selectProject: (projectId) => dispatch(actionCreator(ActiveProjectType, projectId)),
        removeUser: (projectId, userId) => { dispatch(actionCreator(RemoveUserType, { projectId, userId })); },
        invite: (projectId, emails) => { dispatch(actionCreator(InviteMemberType, { projectId, emails })); },
        createEnv: (env) => { dispatch(actionCreator(SaveEnvironmentType, { isNew: true, env })); },
        updateEnv: (env) => { dispatch(actionCreator(SaveEnvironmentType, { isNew: false, env })); },
        delEnv: (envId, projectId) => { dispatch(actionCreator(DelEnvironmentType, { envId, projectId })); },
        editEnvCompleted: () => { dispatch(actionCreator(EditEnvCompletedType)); },
        editEnv: (projectId, envId) => dispatch(actionCreator(EditEnvType, { projectId, envId })),
        changeLocalhost: (id, projectId, userId, ip) => { dispatch(actionCreator(SaveLocalhostMappingType, { isNew: !id, id: id || StringUtil.generateUID(), projectId, userId, ip })); },
        saveGlobalFunc: (projectId, globalFunc) => { dispatch(actionCreator(SaveGlobalFunctionType, { projectId, globalFunc })); },
        deleteFile: (pid, name, type) => { dispatch(actionCreator(DeleteProjectFileType, { pid, name, type })); }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Project);