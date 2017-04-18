import React from 'react';
import { Record } from '../../../api/models/record';

interface IRecordItemProps extends Record { }

interface IRecordItemState { }

class RecordItem extends React.Component<IRecordItemProps, IRecordItemState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default RecordItem;