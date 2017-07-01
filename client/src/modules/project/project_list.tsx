import React from 'react';
import { Menu, Tooltip, Button } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import ProjectItem from './project_item';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DtoProject } from '../../../../api/interfaces/dto_project';
import { StringUtil } from '../../utils/string_util';
import { DtoUser } from '../../../../api/interfaces/dto_user';

interface ProjectListProps {

    user: DtoUser;

    projects: DtoProject[];

    activeProject: string;

    disbandProject(project: DtoProject);

    quitProject(project: DtoProject);

    updateProject(project: DtoProject);

    createProject(project: DtoProject);

    selectProject(projectId: string);
}

interface ProjectListState { }

const createDefaultProject = (user: DtoUser) => {
    return {
        id: StringUtil.generateUID(),
        name: 'New Project',
        owner: user,
        members: [user]
    };
};

class ProjectList extends React.Component<ProjectListProps, ProjectListState> {

    private currentNewProject: DtoProject | undefined;
    private projectRefs: _.Dictionary<ProjectItem> = {};

    constructor(props: ProjectListProps) {
        super(props);
    }

    componentDidUpdate(prevProps: ProjectListProps, prevState: ProjectListState) {
        if (this.currentNewProject && this.projectRefs[this.currentNewProject.id]) {
            this.projectRefs[this.currentNewProject.id].edit();
            this.currentNewProject = undefined;
        }
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

    public render() {
        return (
            <div>
                <div className="small-toolbar">
                    <span>Projects</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create project">
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
                                        />
                                    </Menu.Item>
                                )
                            )
                        }
                    </Menu>
                </PerfectScrollbar>
            </div>
        );
    }
}

export default ProjectList;