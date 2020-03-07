define(function(require) {
  return cell => {
    class Module extends cell {
      refresh() {
        super.refresh();
        console.log("refresh");
        this._fragment = null;
      }

      get fragment() {
        if (this._fragment === null) {
          this.board.checkFragment(this.constructor.fragmentDivideMark);
        }
        return this._fragment;
      }
    }
    return Module;
  };
});
