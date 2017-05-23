import React from 'react';
import { Menu } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { DtoResTeam } from '../../../../api/interfaces/dto_res';
import TeamItem from './team_item';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface TeamListProps {

    userId: string;

    teams: DtoResTeam[];

    disbandTeam(team: DtoResTeam);

    quitTeam(team: DtoResTeam);

    updateTeam(team: DtoResTeam);
}

interface TeamListState {
    activeTeam: string;
}

class TeamList extends React.Component<TeamListProps, TeamListState> {

    constructor(props: TeamListProps) {
        super(props);
        this.state = {
            activeTeam: props.teams.length > 0 ? props.teams[0].id : ''
        };
    }

    private onSelectChanged = (param: SelectParam) => {
        this.setState({ ...this.state, activeTeam: param.item.props.data });
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
                    className="collection-tree"
                    mode="inline"
                    inlineIndent={0}
                    selectedKeys={[this.state.activeTeam]}
                    onSelect={this.onSelectChanged}
                >
                    {
                        this.props.teams.map(t =>
                            (
                                <TeamItem
                                    team={t}
                                    isOwner={t.owner.id === this.props.userId}
                                    disbandTeam={this.props.disbandTeam(t)}
                                    quitTeam={this.props.quitTeam(t)}
                                    onNameChanged={name => this.changeTeamName(name, t)}
                                />
                            )
                        )
                    }
                </Menu>
            </PerfectScrollbar>
        );
    }
}

export default TeamList;