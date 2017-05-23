import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Layout } from 'antd';
import Splitter from '../../components/splitter';
import TeamList from './team_list';
import { DtoResTeam } from '../../../../api/interfaces/dto_res';
import { DtoTeam } from '../../../../api/interfaces/dto_team';
import { State } from '../../state';
import { actionCreator, UpdateLeftPanelType, ResizeLeftPanelType } from '../../action';
import { DisbandTeamType, QuitTeamType, SaveTeamType } from './action';

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

interface TeamState { }

class Team extends React.Component<TeamProps, TeamState> {
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
                    <TeamList userId={userId} teams={teams} disbandTeam={disbandTeam} quitTeam={quitTeam} updateTeam={updateTeam} />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content style={{ marginTop: 4 }}>
                    body
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