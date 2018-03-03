import { Modal } from 'antd';
import LocalesString from '../../locales/string';

export function confirmDlg(title: string | React.ReactNode, onOk: (func: Function) => any, action: string | React.ReactNode = 'delete') {
    Modal.confirm({
        title,
        content: LocalesString.get('Common.ConfirmContent', { action }),
        okText: 'Yes',
        cancelText: 'No',
        onOk,
    });
}