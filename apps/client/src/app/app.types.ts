export type TTask = {
  _id: string;
  title?: string; // Support older "title" field
  name?: string; // Support newer "name" field
  description?: string;
  completed: boolean;
  owner: string;
  createdAt: string;
};
