const walk = require("walk");
const path = require("path");

require("search-index")
  .OPEN({ name: "idx" })
  .then(idx => {
    const walker = walk.walk("/Users/aran/work");

    data = [];

    walker.on("directory", (root, stats, next) => {
      const { name, atime, mtime, ctime, size, type } = stats;
      data.push({ name, atime, mtime, ctime, size, type });
      next();
    });

    walker.on("file", (root, stats, next) => {
      const { name, atime, mtime, ctime, size, type } = stats;
      const ext = path.extname(name);
      data.push({ name, atime, mtime, ctime, size, type, ext });
      if (data.length > 500) {
        let indexput = data.slice(0);
        data = [];
        idx.PUT(indexput).then(() => console.log("data put"));
      }
      next();
    });

    walker.on("end", () => {
      console.log("done");
    });
  });
