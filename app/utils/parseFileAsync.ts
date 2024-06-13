import Papa from 'papaparse';

export const parseFileAsync = (file: File) => {
  return new Promise((resolve: (value: string[][]) => void, reject) => {
    Papa.parse<File>(file, {
      complete: (e) => {
        if (e.data && e.data.length > 0) {
          // TODO: unfortunately the papaparse typing is such that e.data is a File[], when in reality it should be [][]
          // consider patching papaparse, else just leave this as-is :shrug:
          return resolve(e.data as unknown as [][]);
        }
        reject({ message: 'Error parsing file', errors: e.errors });
      },
    });
  });
};
