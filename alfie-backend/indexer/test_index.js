require("search-index")
  .OPEN({ name: "idx" })
  .then(idx => {
    const { SEARCH, OR } = idx;

    SEARCH("ext:.pdf").then(result => {
      console.log(result);
    });
  });
