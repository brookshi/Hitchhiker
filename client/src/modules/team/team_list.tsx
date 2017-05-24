import React from 'react';
import { Menu } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { DtoResTeam } from '../../../../api/interfaces/dto_res';
import TeamItem from './team_item';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface TeamListProps {

    userId: string;

    teams: DtoResTeam[];

    activeTeam: string;

    disbandTeam(team: DtoResTeam);

    quitTeam(team: DtoResTeam);

    updateTeam(team: DtoResTeam);

    selectTeam(teamId: string);
}

interface TeamListState { }

class TeamList extends React.Component<TeamListProps, TeamListState> {

    constructor(props: TeamListProps) {
        super(props);
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.selectTeam(param.item.props.data);
    }

    private changeTeamName = (name: string, team: DtoResTeam) => {
        if (name.trim() !== '' && name !== team.name) {
            team.name = name;
            this.props.updateTeam(team);
        }
    }

    public render() {
        return (
            <PerfectScrollbar>
                <Menu
                    className="team-list"
                    mode="inline"
                    inlineIndent={0}
                    selectedKeys={[this.props.activeTeam]}
                    onSelect={this.onSelectChanged}
                >
                    {
                        this.props.teams.map(t =>
                            (
                                <Menu.Item key={t.id} data={t}>
                                    <TeamItem
                                        team={t}
                                        isOwner={t.owner.id === this.props.userId}
                                        disbandTeam={this.props.disbandTeam(t)}
                                        quitTeam={this.props.quitTeam(t)}
                                        onNameChanged={name => this.changeTeamName(name, t)}
                                    />
                                </Menu.Item>
                            )
                        )
                    }
                </Menu>
            </PerfectScrollbar>
        );
    }
}

export default TeamList;