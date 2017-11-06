import React from 'react';
import { Table, Upload, Button, message, Modal } from 'antd';
import { ProjectData, ProjectFiles } from '../../../../api/interfaces/dto_project_data';
import * as _ from 'lodash';
import { ProjectFileType } from '../../common/custom_type';

interface ProjectDataDialogProps {

    projectId: string;

    type: ProjectFileType;

    projectFiles: ProjectFiles;

    isDlgOpen: boolean;

    title: string;

    deleteFile(pid: string, name: string, type: ProjectFileType);
}

interface ProjectDataDialogState { }

type ProjectDisplayData = ProjectData & { isGlobal: boolean };

class ProjectLibTable extends Table<ProjectDisplayData> { }

class ProjectLibColumn extends Table.Column<ProjectDisplayData> { }

class ProjectDataDialog extends React.Component<ProjectDataDialogProps, ProjectDataDialogState> {

    private constructProjectLibs = () => {
        const { globalJS, projectJS } = this.props.projectFiles;
        return _.concat(_.values(projectJS).map(j => ({ ...j, isGlobal: false })), _.values(globalJS).map(j => ({ ...j, isGlobal: true })));
    }

    private delProjectLib = (plib: ProjectDisplayData) => {
        const { projectId, type, deleteFile } = this.props;
        deleteFile(projectId, plib.name, type);
    }

    private onUploadStatusChange(info: any) {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    public render() {
        const projectLibs = this.constructProjectLibs();
        const { isDlgOpen, title } = this.props;
        return (
            <Modal
                visible={isDlgOpen}
                title={title}
                width={770}
                footer={[]}
            >
                <div>
                    <Upload accept=".zip" action="" multiple={true} withCredentials={true} onChange={this.onUploadStatusChange}>
                        <Button
                            className="project-create-btn"
                            type="primary"
                            size="small"
                            icon="upload"
                            ghost={true}
                        >
                            Upload new javascript lib (zip)
                    </Button>
                    </Upload>
                    <ProjectLibTable
                        className="project-table"
                        bordered={true}
                        size="middle"
                        rowKey="file"
                        dataSource={projectLibs}
                        pagination={false}
                    >
                        <ProjectLibColumn
                            title="Name"
                            dataIndex="name"
                        />
                        <ProjectLibColumn
                            title="Path"
                            dataIndex="path"
                        />
                        <ProjectLibColumn
                            title="Size"
                            dataIndex="size"
                            render={(text, record) => (record.size > 1024 * 1024 ? `${_.round(record.size / (1024 * 1024), 2)} MB` : (record.size > 1024 ? `${_.round(record.size / 1024, 2)} KB` : text))}
                        />
                        <ProjectLibColumn
                            title="CreatedDate"
                            dataIndex="createdDate"
                        />
                        <ProjectLibColumn
                            title="Action"
                            key="action"
                            width={140}
                            render={(text, record) => (
                                <span>
                                    <a href="#" onClick={() => this.delProjectLib(record)}>Delete</a>
                                </span>
                            )}
                        />
                    </ProjectLibTable>
                </div>
            </Modal>
        );
    }
}

export default ProjectDataDialog;