define(function(require) {
  return (cell, marks = [1]) => {
    class Module extends cell {
      get cluster() {
        return (
          this.isCluster() ||
          this.cell(0, -1).isCluster() ||
          this.cell(-1, 0).isCluster() ||
          this.cell(-1, -1).isCluster()
        );
      }

      isCluster() {
        if (this.wall || !marks.includes(this.marked)) {
          return false;
        }
        const arounds = [
          [1, 0],
          [0, 1],
          [1, 1]
        ];
        for (const around of arounds) {
          const cell = this.cell(...around);
          if (cell.wall || cell.marked !== this.marked) {
            return false;
          }
        }
        return true;
      }
    }
    return Module;
  };
});
