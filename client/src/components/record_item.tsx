import React from 'react';
import { DtoRecord } from "../../../api/interfaces/dto_record";

interface IRecordItemProps extends DtoRecord { }

interface IRecordItemState { }

class RecordItem extends React.Component<IRecordItemProps, IRecordItemState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default RecordItem;