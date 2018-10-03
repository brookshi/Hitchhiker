import React from 'react';
import { connect } from 'react-redux';
import { Alert, Icon, Input } from 'antd';
import { actionCreator } from '../../../action/index';
import { UpdateDisplayRecordPropertyType } from '../../../action/record';
import { getActiveRecordSelector, getActiveRecordStateSelector } from './selector';
import { ConflictType } from '../../../misc/conflict_type';
import { ShowTimelineType, ToggleRequestDescriptionType } from '../../../action/ui';
import Msg from '../../../locales';
import { State } from '../../../state/index';
import LocalesString from '../../../locales/string';
import ValidatedName from '../../../components/validated_name';

const TextArea = Input.TextArea;

interface RequestNamePanelStateProps {

    activeKey: string;

    id: string;

    name: string;

    description: string;

    notShowConflict?: boolean;

    conflictType: ConflictType;

    displayRequestDescription?: boolean;
}

interface RequestNamePanelDispatchProps {

    changeRecord(value: { [key: string]: any });

    showTimeLine(id: string);

    toggleRequestDescription(id: string, display: boolean);
}

type RequestNamePanelProps = RequestNamePanelStateProps & RequestNamePanelDispatchProps;

interface RequestNamePanelState { }

class RequestNamePanel extends React.Component<RequestNamePanelProps, RequestNamePanelState> {

    constructor(props: RequestNamePanelProps) {
        super(props);
        this.state = {};
    }

    private onNameChanged = (value: string) => {
        this.props.changeRecord({ 'name': value });
    }

    private onDescriptionChanged = (value: string) => {
        this.props.changeRecord({ 'description': value });
    }

    private getConflictModifyMsg = () => {
        return (
            <div>
                <span>{Msg('Collection.HasModified')}</span>
                <span style={{ marginLeft: 12 }}><a onClick={() => this.props.showTimeLine(this.props.activeKey)}>{Msg('Collection.ViewChanges')}</a></span>
            </div>
        );
    }

    public render() {

        const { id, name, description, notShowConflict, conflictType, displayRequestDescription, toggleRequestDescription } = this.props;
        const currentConflictType = notShowConflict ? ConflictType.none : conflictType;

        return (
            <div>
                {
                    currentConflictType === ConflictType.delete ?
                        <Alert message={Msg('Collection.HasDelete')} type="error" showIcon={true} closable={true} /> : (
                            currentConflictType === ConflictType.modify ?
                                <Alert message={this.getConflictModifyMsg()} type="warning" showIcon={true} closable={true} /> : ''
                        )
                }
                <div>
                    <span className="req-panel-name-caret" onClick={() => toggleRequestDescription(id, !displayRequestDescription)}><Icon type={displayRequestDescription ? 'caret-down' : 'caret-right'} /></span>
                    <span className="req-panel">
                        <ValidatedName name={name} onNameChanged={n => this.onNameChanged(n)} />
                    </span>
                </div>
                {
                    displayRequestDescription ? (
                        <div className="req-panel-description" style={{ marginBottom: 8 }}>
                            <TextArea
                                placeholder={LocalesString.get('Collection.RequestDescription')}
                                spellCheck={false}
                                onChange={(e) => this.onDescriptionChanged(e.currentTarget.value)}
                                value={description}
                                autosize={true}
                            />
                        </div>
                    ) : null
                }
            </div>
        );
    }
}

const mapStateToProps = (state: State): RequestNamePanelStateProps => {
    const activeRecordState = getActiveRecordStateSelector()(state);
    const activeKey = state.displayRecordsState.activeKey;
    const activeUIState = state.uiState.reqResUIState[activeRecordState.record.id];
    return {
        activeKey,
        id: activeRecordState.record.id,
        name: getActiveRecordSelector()(state).name,
        description: getActiveRecordSelector()(state).description || '',
        notShowConflict: activeRecordState.notShowConflict,
        conflictType: activeRecordState.conflictType,
        displayRequestDescription: activeUIState ? activeUIState.displayRequestDescription : false
    };
};

const mapDispatchToProps = (dispatch: any): RequestNamePanelDispatchProps => {
    return {
        changeRecord: (value) => dispatch(actionCreator(UpdateDisplayRecordPropertyType, value)),
        showTimeLine: (id) => dispatch(actionCreator(ShowTimelineType, id)),
        toggleRequestDescription: (recordId, displayRequestDescription) => dispatch(actionCreator(ToggleRequestDescriptionType, { recordId, displayRequestDescription }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestNamePanel);