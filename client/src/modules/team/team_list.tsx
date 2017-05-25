import React from 'react';
import { Menu, Tooltip, Button } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import TeamItem from './team_item';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DtoTeam } from '../../../../api/interfaces/dto_team';
import { StringUtil } from '../../utils/string_util';
import { DtoUser } from '../../../../api/interfaces/dto_user';

interface TeamListProps {

    user: DtoUser;

    teams: DtoTeam[];

    activeTeam: string;

    disbandTeam(team: DtoTeam);

    quitTeam(team: DtoTeam);

    updateTeam(team: DtoTeam);

    createTeam(team: DtoTeam);

    selectTeam(teamId: string);
}

interface TeamListState { }

const createDefaultTeam = (user: DtoUser) => {
    return {
        id: StringUtil.generateUID(),
        name: 'New Team',
        owner: user,
        members: [user]
    };
};

class TeamList extends React.Component<TeamListProps, TeamListState> {

    private currentNewTeam: DtoTeam | undefined;
    private teamRefs: _.Dictionary<TeamItem> = {};

    constructor(props: TeamListProps) {
        super(props);
    }

    componentDidUpdate(prevProps: TeamListProps, prevState: TeamListState) {
        if (this.currentNewTeam && this.teamRefs[this.currentNewTeam.id]) {
            this.teamRefs[this.currentNewTeam.id].edit();
            this.currentNewTeam = undefined;
        }
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.selectTeam(param.item.props.data.id);
    }

    private changeTeamName = (name: string, team: DtoTeam) => {
        if (name.trim() !== '' && name !== team.name) {
            team.name = name;
            this.props.updateTeam(team);
        }
    }

    private createTeam = () => {
        const newTeam = createDefaultTeam(this.props.user);
        this.currentNewTeam = newTeam;
        this.props.createTeam(newTeam);
    }

    public render() {
        return (
            <div>
                <div className="small-toolbar">
                    <span>Teams:</span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create collection">
                        <Button className="icon-btn team-add-btn" type="primary" icon="usergroup-add" onClick={this.createTeam} />
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
                                            ref={ele => this.teamRefs[t.id] = ele}
                                            team={t}
                                            isOwner={t.owner.id === this.props.user.id}
                                            disbandTeam={() => this.props.disbandTeam(t)}
                                            quitTeam={() => this.props.quitTeam(t)}
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