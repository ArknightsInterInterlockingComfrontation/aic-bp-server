import mri from "mri";
const argsOptions: mri.Options = {
  boolean: ["h", "help", "v", "version"],
  string: ["host", "name", "cookieAge", "sessionAge","port"],
  alias: {
    v: "version",
    h: ["help"],
  },
  default: {
  },
};

const args = mri(process.argv.slice(2), argsOptions);
export default args;
