import { Modal } from 'antd';
import Msg from '../../locales';

export function confirmDlg(title: string | React.ReactNode, onOk: (func: Function) => any, action: string | React.ReactNode = 'delete') {
    Modal.confirm({
        title,
        content: Msg('Common.ConfirmContent', { action }),
        okText: 'Yes',
        cancelText: 'No',
        onOk,
    });
}