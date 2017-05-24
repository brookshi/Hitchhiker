import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Layout } from 'antd';
import Splitter from '../../components/splitter';
import TeamList from './team_list';
import Members from './members';
import { DtoResTeam } from '../../../../api/interfaces/dto_res';
import { DtoTeam } from '../../../../api/interfaces/dto_team';
import { State } from '../../state';
import { actionCreator, UpdateLeftPanelType, ResizeLeftPanelType } from '../../action';
import { DisbandTeamType, QuitTeamType, SaveTeamType } from './action';
import './style/index.less';
import * as _ from 'lodash';

const { Content, Sider } = Layout;

interface TeamStateProps {

    collapsed: boolean;

    leftPanelWidth: number;

    userId: string;

    teams: DtoResTeam[];
}

interface TeamDispatchProps {

    resizeLeftPanel(width: number);

    collapsedLeftPanel(collapsed: boolean);

    disbandTeam(team: DtoTeam);

    quitTeam(team: DtoTeam);

    updateTeam(team: DtoTeam);

    createTeam(team: DtoTeam);
}

type TeamProps = TeamStateProps & TeamDispatchProps;

interface TeamState {

    activeTeam: string;
}

class Team extends React.Component<TeamProps, TeamState> {

    constructor(props: TeamProps) {
        super(props);
        this.state = {
            activeTeam: props.teams.length > 0 ? props.teams[0].id : ''
        };
    }

    isSelectTeamOwn = () => {
        const team = this.props.teams.find(t => t.id === this.state.activeTeam);
        return !!team && team.owner.id === this.props.userId;
    }

    getSelectTeamMembers = () => {
        const team = this.props.teams.find(t => t.id === this.state.activeTeam);
        if (!team) {
            return [];
        }
        return _.sortBy(team.members.map(t => ({ name: t.name, email: t.email, isOwner: t.id === this.props.userId })), m => m.name);
    }

    public render() {
        const { userId, collapsed, collapsedLeftPanel, teams, leftPanelWidth, disbandTeam, quitTeam, updateTeam } = this.props;

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
                        activeTeam={this.state.activeTeam}
                        selectTeam={(id) => this.setState({ ...this.state, activeTeam: id })}
                        userId={userId}
                        teams={teams}
                        disbandTeam={disbandTeam}
                        quitTeam={quitTeam}
                        updateTeam={updateTeam}
                    />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content className="team-right-panel">
                    <Members
                        isOwner={this.isSelectTeamOwn()}
                        members={this.getSelectTeamMembers()}
                    />
                </Content>
            </Layout>
        );
    }
}

const mapStateToProps = (state: State): TeamStateProps => {
    return {
        leftPanelWidth: state.uiState.leftPanelWidth,
        collapsed: state.uiState.collapsed,
        userId: state.userState.userInfo.id,
        teams: state.userState.userInfo.teams
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): TeamDispatchProps => {
    return {
        resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width)),
        collapsedLeftPanel: (collapsed) => dispatch(actionCreator(UpdateLeftPanelType, collapsed)),
        disbandTeam: (team) => dispatch(actionCreator(DisbandTeamType, team)),
        quitTeam: (team) => dispatch(actionCreator(QuitTeamType, team)),
        updateTeam: (team) => dispatch(actionCreator(SaveTeamType, { isNew: false, team })),
        createTeam: (team) => dispatch(actionCreator(SaveTeamType, { isNew: true, team }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Team);