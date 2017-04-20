import React from 'react';
//import { DtoResRecord } from "../../../api/interfaces/dto_res";

interface IRecordItemProps { }//extends DtoResRecord { }

interface IRecordItemState { }

class RecordItem extends React.Component<IRecordItemProps, IRecordItemState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default RecordItem;