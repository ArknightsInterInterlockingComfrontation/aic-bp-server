export interface FormatTreeData {
  pid: number;
  id: number;
  children: FormatTreeData[];
}

export interface FormatTree {
  (data: FormatTreeData[]): object[];
}
export interface DataToTree {
  (parents: FormatTreeData[], children: FormatTreeData[]): void;
}

export const formatTree: FormatTree = (data) => {
  let parents = data.filter((p) => p.pid === -1),
    children = data.filter((c) => c.pid > -1);
  dataToTree(parents, children);

  return parents;
};

export const dataToTree: DataToTree = (parents, children) => {
  parents.map((p) => {
    children.map((c, i) => {
      if (c.pid === p.id) {
        let _c = JSON.parse(JSON.stringify(children));
        _c.splice(i, 1);
        dataToTree([c], _c);

        if (p.children) {
          p.children.push(c);
        } else {
          p.children = [c];
        }
      }
    });
  });
};
