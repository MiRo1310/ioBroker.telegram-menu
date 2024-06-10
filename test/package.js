const path = require("path"); // eslint-disable-line @typescript-eslint/no-var-requires
const { tests } = require("@iobroker/testing"); // eslint-disable-line @typescript-eslint/no-var-requires

// Validate the package files
tests.packageFiles(path.join(__dirname, ".."));
