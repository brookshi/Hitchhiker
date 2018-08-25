import React from 'react';
import './style/index.less';
import { Timeline, Modal } from 'antd';
import { DtoRecord, DtoRecordHistory } from '../../common/interfaces/dto_record';
import { StringUtil } from '../../utils/string_util';
import { unknownName } from '../../misc/constants';
import * as _ from 'lodash';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light';
import js from 'react-syntax-highlighter/dist/languages/javascript';
import xcode from 'react-syntax-highlighter/dist/styles/xcode';
import { DiffMode, DiffType } from '../../misc/custom_type';
import { IDiffResult } from 'diff';
import * as JsDiff from 'diff';
import { ParameterType } from '../../misc/parameter_type';
import Msg from '../../locales';

registerLanguage('javascript', js);

interface RecordTimelineProps {

    record?: DtoRecord;

    visible: boolean;

    onClose();
}

interface RecordTimelineState {

    diffMode: DiffMode;

    codeLevel: number;
}

const diffFuncMap = {
    [DiffType.chars]: JsDiff.diffChars,
    [DiffType.words]: JsDiff.diffWords,
    [DiffType.lines]: JsDiff.diffLines
};

class RecordTimeline extends React.Component<RecordTimelineProps, RecordTimelineState> {

    constructor(props: RecordTimelineProps) {
        super(props);
        this.state = {
            diffMode: DiffType.lines,
            codeLevel: 0
        };
    }

    private generateTimeLineItem = (item: DtoRecordHistory, last: DtoRecordHistory) => {
        const record = item.record;
        const lastRecord = last ? last.record : undefined;
        return (
            <Timeline.Item className="record-timeline-item" key={item.id}>
                <p style={{ fontWeight: 'bold' }}>{`${new Date(item.createDate).toLocaleString()}: ${item.user ? item.user.name : unknownName}`}</p>
                <div className="record-timeline-item-detail">
                    {this.generateItem('name', this.getDiffChars(record, lastRecord, 'name'), true)}
                    {this.generateItem('method', this.getDiffChars(record, lastRecord, 'method', DiffType.words), true)}
                    {this.generateItem('url', this.getDiffChars(record, lastRecord, 'url'))}
                    {this.generateItem('headers', this.getDiffCode(record, lastRecord, 'headers', StringUtil.headersToString))}
                    {this.generateItem('parameterType', this.getDiffCode(record, lastRecord, 'parameterType', t => ParameterType[t]))}
                    {this.generateItem('parameters', this.getDiffCode(record, lastRecord, 'parameters'))}
                    {this.generateItem('body', this.getDiffCode(record, lastRecord, 'body'))}
                    {this.generateItem('test', this.getDiffCode(record, lastRecord, 'test'))}
                    {this.generateItem('prescript', this.getDiffCode(record, lastRecord, 'prescript'))}
                </div>
            </Timeline.Item>
        );
    }

    private getDiffCode = (record: DtoRecord, lastRecord: DtoRecord | undefined, prop: string, format?: (c: any) => string) => {
        if (!lastRecord) {
            const content = format ? format(record[prop] || '') : record[prop] || '';
            return { isChanged: !!content, content: <SyntaxHighlighter language="javascript" style={xcode}>{content}</SyntaxHighlighter> };
        }
        return this.getDiffLines(record, lastRecord, prop, format);
    }

    private getDiffLines = (record: DtoRecord, lastRecord: DtoRecord | undefined, prop: string, format?: (c: any) => string) => {
        let content = format ? format(record[prop] || '') : record[prop] || '';
        content = content !== '' ? `${content}\n` : '';
        let lastContent = lastRecord ? (format ? format(lastRecord[prop] || '') : (lastRecord[prop] || '')) : '';
        lastContent = lastContent !== '' ? `${lastContent}\n` : '';
        const isChanged = !lastRecord || content !== lastContent;
        if (!lastRecord) {
            return { isChanged, content };
        }
        const codeLevel = this.state.codeLevel;
        const prevLines = new Array<IDiffResult>();
        const nextLines = new Array<IDiffResult>();
        const lines = new Array<any>();
        let continousLineCount = 0;
        diffFuncMap[DiffType.lines](lastContent, content).forEach((part: IDiffResult, index: number) => {
            if (part.added || part.removed) {
                lines.push(_.uniq([...nextLines.map((r) => this.getValueWithFlag(r)), ...(continousLineCount > codeLevel * 2 ? [<p key="1">...</p>] : []), ...prevLines.map(r => this.getValueWithFlag(r))]));
                continousLineCount = 0;
                prevLines.splice(0, prevLines.length);
                nextLines.splice(0, nextLines.length);
                const style = { backgroundColor: this.getDiffBackgroundColor(part), color: this.getDiffForegroundColor(part) };
                lines.push(<pre key={index} style={style}>{this.getValueWithFlag(part)}</pre>);
            } else if (codeLevel > 0) {
                continousLineCount++;
                const norPartLines = part.value.split('\n').map(v => ({ value: v, count: 1 }));
                prevLines.push(...norPartLines);
                if (prevLines.length > codeLevel) {
                    prevLines.splice(0, prevLines.length - codeLevel);
                }
                nextLines.push(...norPartLines);
                if (nextLines.length > codeLevel) {
                    nextLines.splice(codeLevel);
                }
            }
        });
        return { isChanged, content: lines };
    }

    private getDiffChars = (record: DtoRecord, lastRecord: DtoRecord | undefined, prop: string, diffMode: DiffMode = DiffType.chars) => {
        const content = record[prop] || '';
        const lastContent = (lastRecord ? lastRecord[prop] : '') || '';
        const isChanged = (!lastRecord && !!content) || content !== lastContent;

        return {
            isChanged, content: !!lastRecord ? diffFuncMap[diffMode](lastContent, content).map((part: any, index: number) => {
                var spanStyle = { backgroundColor: this.getDiffBackgroundColor(part), color: this.getDiffForegroundColor(part) };
                return <span key={index} style={spanStyle}>{part.value}</span>;
            }) : content
        };
    }

    private getValueWithFlag = (part: IDiffResult) => {
        return part.value.split('\n').map(v => !!v ? `${part.added ? '+' : (part.removed ? '-' : ' ')} ${v}` : '').join('\n');
    }

    private getDiffBackgroundColor = (part: IDiffResult) => {
        return part.added ? '#eaf2c2' : part.removed ? '#fadad7' : '';
    }

    private getDiffForegroundColor = (part: IDiffResult) => {
        return part.added ? '#406619' : part.removed ? '#b30000' : '';
    }

    private generateItem = (prop: string, data: any, inline?: boolean) => {
        const { isChanged, content } = data;
        return (
            isChanged ? (
                <div>
                    <span style={{ fontWeight: 'bold', fontSize: 12 }}>{prop.toUpperCase()}</span>
                    {inline ? <span className="record-timeline-item-detailitem-inline">{content}</span> : <div className="record-timeline-item-detailitem"> {content} </div>}
                </div>
            ) : ''
        );
    }

    public render() {
        const { record, visible, onClose } = this.props;
        return (
            <div>
                {
                    record && record.history ? (
                        <Modal
                            visible={visible}
                            title={Msg('Component.HistoryDesc', { length: record.history.length })}
                            footer={[]}
                            onCancel={onClose}
                            width={600}
                            closable={true}
                        >
                            <div>
                                <Timeline>
                                    {
                                        _.orderBy(record.history, 'id', 'desc').map((r, i, arr) => this.generateTimeLineItem(r, arr[i + 1]))
                                    }
                                </Timeline>
                            </div>
                        </Modal>
                    ) : ''
                }
            </div>
        );
    }
}

export default RecordTimeline;