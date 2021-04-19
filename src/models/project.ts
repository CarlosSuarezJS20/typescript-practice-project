export enum ProjectStatus {
  NewTicket,
  InProgress,
  Finished,
}

export class Project {
  constructor(
    public id: string,
    public t: string,
    public desc: string,
    public people: number,
    public projectStatus: ProjectStatus
  ) {}
}
