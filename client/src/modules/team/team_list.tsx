import React from 'react';
import { Menu, Tooltip, Button } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { DtoResTeam } from '../../../../api/interfaces/dto_res';
import TeamItem from './team_item';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DtoTeam } from '../../../../api/interfaces/dto_team';
import { StringUtil } from '../../utils/string_util';

interface TeamListProps {

    userId: string;

    teams: DtoResTeam[];

    activeTeam: string;

    disbandTeam(team: DtoTeam);

    quitTeam(team: DtoTeam);

    updateTeam(team: DtoTeam);

    addTeam(team: DtoTeam);

    selectTeam(teamId: string);
}

interface TeamListState { }

const createDefaultTeam: () => DtoTeam = () => {
    return {
        id: StringUtil.generateUID(),
        name: 'New Team'
    };
};

class TeamList extends React.Component<TeamListProps, TeamListState> {

    constructor(props: TeamListProps) {
        super(props);
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.selectTeam(param.item.props.data.id);
    }

    private changeTeamName = (name: string, team: DtoResTeam) => {
        if (name.trim() !== '' && name !== team.name) {
            team.name = name;
            this.props.updateTeam(team);
        }
    }

    private addTeam = () => {
        createDefaultTeam();
    }

    public render() {
        return (
            <div>
                <div className="small-toolbar">
                    <span>Teams:</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create collection">
                        <Button className="icon-btn team-add-btn" type="primary" icon="usergroup-add" onClick={this.addTeam} />
                    </Tooltip>
                </div>
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
            </div>
        );
    }
}

export default TeamList;