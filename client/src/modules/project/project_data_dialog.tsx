import React from 'react';
import { Table, Upload, Button, message, Modal, Popconfirm } from 'antd';
import { ProjectData, ProjectFiles } from '../../../../api/src/interfaces/dto_project_data';
import * as _ from 'lodash';
import { ProjectFileType, ProjectFileTypes } from '../../common/custom_type';
import { Urls } from '../../utils/urls';
import Msg from '../../locales';
import LocalesString from '../../locales/string';

interface ProjectDataDialogProps {

    projectId: string;

    type: ProjectFileType;

    projectFiles: ProjectFiles;

    isDlgOpen: boolean;

    title: string | React.ReactNode;

    deleteFile(pid: string, name: string, type: ProjectFileType);

    addFile(pid: string, name: string, path: string, type: ProjectFileType);

    onClose();
}

interface ProjectDataDialogState { }

type ProjectDisplayData = ProjectData & { isGlobal: boolean };

class ProjectLibTable extends Table<ProjectDisplayData> { }

class ProjectLibColumn extends Table.Column<ProjectDisplayData> { }

class ProjectDataDialog extends React.Component<ProjectDataDialogProps, ProjectDataDialogState> {

    private constructProjectLibs = () => {
        const isLib = this.props.type === ProjectFileTypes.lib;
        const { globalJS, globalData, projectJS, projectData } = this.props.projectFiles;
        const projectDatas = _.orderBy(_.values((isLib ? projectJS : projectData)[this.props.projectId] || {}).map(j => ({ ...j, isGlobal: false })), ['createdDate'], ['desc']);
        const globalDatas = _.orderBy(_.values(isLib ? globalJS : globalData).map(j => ({ ...j, isGlobal: true })), ['createdDate'], ['desc']);
        return _.concat(projectDatas, globalDatas);
    }

    private delProjectLib = (plib: ProjectDisplayData) => {
        const { projectId, type, deleteFile } = this.props;
        deleteFile(projectId, plib.name, type);
    }

    private onUploadStatusChange = (info: any) => {
        if (info.file.status === 'done') {
            const { addFile, projectId, type } = this.props;
            const fileNameWithoutExt = this.removeExt(info.file.name);
            addFile(projectId, fileNameWithoutExt, `${projectId}/${fileNameWithoutExt}`, type);
            message.success(LocalesString.get('Project.UploadFileSuccess', { name: info.file.name }));
        } else if (info.file.status === 'error') {
            message.error(LocalesString.get('Project.UploadFileFail', { name: info.file.name }));
        }
    }

    private removeExt = (file: string) => {
        if (this.props.type === ProjectFileTypes.lib) {
            const dotIndex = file.lastIndexOf('.');
            if (dotIndex > 0) {
                return file.substr(0, dotIndex);
            }
        }
        return file;
    }

    public render() {
        const projectLibs = this.constructProjectLibs();
        const { isDlgOpen, title, projectId, onClose, type } = this.props;
        const isLib = type === ProjectFileTypes.lib;
        const action = Urls.getUrl(`project/${projectId}/${type}`);
        return (
            <Modal
                visible={isDlgOpen}
                title={title}
                width={1060}
                closable={true}
                onCancel={onClose}
                footer={[]}
            >
                <div>
                    <div style={{ height: 30 }}>
                        <Upload accept={isLib ? '.zip' : ''} action={action} multiple={false} name="projectfile" showUploadList={false} withCredentials={true} onChange={this.onUploadStatusChange}>
                            <Button size="small" icon="upload" >
                                {Msg('Project.Upload', { name: isLib ? 'javascript lib (zip)' : 'data file' })}
                            </Button>
                        </Upload>
                    </div>
                    <div style={{ height: 600, overflowY: 'auto' }}>
                        <ProjectLibTable
                            className="project-table"
                            bordered={true}
                            size="middle"
                            rowKey="file"
                            dataSource={projectLibs}
                            pagination={false}
                        >
                            <ProjectLibColumn
                                title={Msg('Project.Name')}
                                dataIndex="name"
                            />
                            <ProjectLibColumn
                                title={Msg('Project.Path')}
                                dataIndex="path"
                                render={(text, record) => {
                                    const globalPathIndex = (text || '').indexOf('global_data');
                                    if (globalPathIndex < 0) {
                                        return (text || '').replace(/\\/g, '/');
                                    } else {
                                        return (text || '').substr(globalPathIndex + 12).replace(/\\/g, '/');
                                    }
                                }
                                }
                            />
                            <ProjectLibColumn
                                title={Msg('Project.Origin')}
                                dataIndex="isGlobal"
                                render={(text, record) => record.isGlobal ? 'global' : 'project'}
                            />
                            {/* <ProjectLibColumn
                            title="Size"
                            dataIndex="size"
                            render={(text, record) => (record.size > 1024 * 1024 ? `${_.round(record.size / (1024 * 1024), 2)} MB` : (record.size > 1024 ? `${_.round(record.size / 1024, 2)} KB` : `${text} B`))}
                        /> */}
                            <ProjectLibColumn
                                title={Msg('Project.CreatedDate')}
                                dataIndex="createdDate"
                                render={(text, record) => new Date(record.createdDate).toLocaleDateString()}
                            />
                            <ProjectLibColumn
                                title={Msg('Project.Action')}
                                key="action"
                                width={140}
                                render={(text, record) => (
                                    record.isGlobal ? '' : (
                                        <span>
                                            <Popconfirm title={Msg('Common.SureDelete')} onConfirm={() => this.delProjectLib(record)}>
                                                <a>{Msg('Common.Delete')}</a>
                                            </Popconfirm>
                                        </span>
                                    )
                                )}
                            />
                        </ProjectLibTable>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default ProjectDataDialog;