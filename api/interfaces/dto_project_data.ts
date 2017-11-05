export interface ProjectData {

    name: string;

    path: string;

    size: number;

    createdDate: Date;
}

export interface ProjectFiles {

    globalJS: _.Dictionary<ProjectData>;

    projectJS: _.Dictionary<ProjectData>;

    globalData: _.Dictionary<ProjectData>;

    projectData: _.Dictionary<ProjectData>;
}