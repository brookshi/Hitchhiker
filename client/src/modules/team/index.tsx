import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Layout } from 'antd';
import Splitter from '../../components/splitter';
import TeamList from './team_list';
import Members from './members';
import Environments from './environments';
import { DtoTeam } from '../../../../api/interfaces/dto_team';
import { State } from '../../state';
import { actionCreator, UpdateLeftPanelType, ResizeLeftPanelType } from '../../action';
import { DisbandTeamType, QuitTeamType, SaveTeamType, RemoveUserType, InviteMemberType, SaveEnvironmentType, DelEnvironmentType, ActiveTeamType, EditEnvCompletedType } from '../../action/team';
import './style/index.less';
import * as _ from 'lodash';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { EditEnvType } from '../../action/record';

const { Content, Sider } = Layout;

interface TeamStateProps {

    activeTeam: string;

    collapsed: boolean;

    leftPanelWidth: number;

    user: DtoUser;

    teams: DtoTeam[];

    environments: _.Dictionary<DtoEnvironment[]>;

    isEditEnvDlgOpen: boolean;

    editedEnvironment?: string;
}

interface TeamDispatchProps {

    resizeLeftPanel(width: number);

    collapsedLeftPanel(collapsed: boolean);

    disbandTeam(team: DtoTeam);

    quitTeam(team: DtoTeam);

    updateTeam(team: DtoTeam);

    createTeam(team: DtoTeam);

    selectTeam(teamId: string);

    removeUser(teamId: string, userId: string);

    invite(teamId: string, emails: string[]);

    createEnv(env: DtoEnvironment);

    updateEnv(env: DtoEnvironment);

    delEnv(envId: string, teamId: string);

    editEnvCompleted();

    editEnv(teamId: string, envId: string);
}

type TeamProps = TeamStateProps & TeamDispatchProps;

interface TeamState { }

class Team extends React.Component<TeamProps, TeamState> {

    constructor(props: TeamProps) {
        super(props);
    }

    isSelectTeamOwn = () => {
        const team = this.props.teams.find(t => t.id === this.props.activeTeam);
        return !!team && !!team.owner && team.owner.id === this.props.user.id;
    }

    getSelectTeamMembers = () => {
        const team = this.props.teams.find(t => t.id === this.props.activeTeam);
        if (!team || !team.members) {
            return [];
        }
        return _.sortBy(team.members.map(t => ({ id: t.id, name: t.name, email: t.email, isOwner: t.id === team.owner.id })), m => m.name);
    }

    getSelectTeamEnvironments = () => {
        const env = this.props.environments[this.props.activeTeam];
        return _.sortBy(env, e => e.name);
    }

    public render() {
        const { user, collapsed, collapsedLeftPanel, teams, leftPanelWidth, disbandTeam, quitTeam, selectTeam, updateTeam, createTeam, removeUser, invite, createEnv, updateEnv, delEnv, isEditEnvDlgOpen, editedEnvironment, activeTeam, editEnvCompleted, editEnv } = this.props;

        return (
            <Layout className="main-panel">
                <Sider
                    className="collection-sider"
                    style={{ minWidth: collapsed ? 0 : leftPanelWidth }}
                    collapsible={true}
                    collapsedWidth="0.1"
                    collapsed={collapsed}
                    onCollapse={collapsedLeftPanel}>
                    <TeamList
                        activeTeam={activeTeam}
                        selectTeam={(id) => selectTeam(id)}
                        user={user}
                        teams={teams}
                        disbandTeam={disbandTeam}
                        quitTeam={quitTeam}
                        updateTeam={updateTeam}
                        createTeam={createTeam}
                    />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content className="team-right-panel">
                    <Members
                        activeTeam={activeTeam}
                        isOwner={this.isSelectTeamOwn()}
                        members={this.getSelectTeamMembers()}
                        removeUser={removeUser}
                        invite={invite}
                    />
                    <div style={{ height: 12 }} />
                    <Environments
                        environments={this.getSelectTeamEnvironments()}
                        createEnv={createEnv}
                        updateEnv={updateEnv}
                        activeTeam={activeTeam}
                        delEnv={envId => delEnv(envId, activeTeam)}
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

const mapStateToProps = (state: State): TeamStateProps => {
    const { leftPanelWidth, collapsed } = state.uiState.appUIState;
    const { activeTeam, teams } = state.teamState;
    const user = state.userState.userInfo as DtoUser;

    return {
        activeTeam,
        leftPanelWidth,
        collapsed,
        user,
        teams: _.chain(teams).values<DtoTeam>().sortBy('name').sortBy(t => t.owner.id !== user.id).value(),
        environments: state.environmentState.environments,
        isEditEnvDlgOpen: state.environmentState.isEditEnvDlgOpen,
        editedEnvironment: state.environmentState.editedEnvironment
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): TeamDispatchProps => {
    return {
        resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width)),
        collapsedLeftPanel: (collapsed) => dispatch(actionCreator(UpdateLeftPanelType, collapsed)),
        disbandTeam: (team) => { dispatch(actionCreator(DisbandTeamType, team)); },
        quitTeam: (team) => { dispatch(actionCreator(QuitTeamType, team)); },
        updateTeam: (team) => dispatch(actionCreator(SaveTeamType, { isNew: false, team })),
        createTeam: (team) => dispatch(actionCreator(SaveTeamType, { isNew: true, team })),
        selectTeam: (teamId) => dispatch(actionCreator(ActiveTeamType, teamId)),
        removeUser: (teamId, userId) => { dispatch(actionCreator(RemoveUserType, { teamId, userId })); },
        invite: (teamId, emails) => { dispatch(actionCreator(InviteMemberType, { teamId, emails })); },
        createEnv: (env) => { dispatch(actionCreator(SaveEnvironmentType, { isNew: true, env })); },
        updateEnv: (env) => { dispatch(actionCreator(SaveEnvironmentType, { isNew: false, env })); },
        delEnv: (envId, teamId) => { dispatch(actionCreator(DelEnvironmentType, { envId, teamId })); },
        editEnvCompleted: () => { dispatch(actionCreator(EditEnvCompletedType)); },
        editEnv: (teamId, envId) => dispatch(actionCreator(EditEnvType, { teamId, envId }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Team);