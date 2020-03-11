define(function(require) {
  return (cell, mark = true) => {
    class Module extends cell {
      get contiguous() {
        if (this.marked !== mark) {
          return false;
        }

        // 2マス連続していたらNG
        for (const cell of this.board.around(this.x, this.y)) {
          if (cell.marked === mark) {
            return true;
          }
        }
        return false;
      }
    }
    return Module;
  };
});
