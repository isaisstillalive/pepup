define(function(require) {
  class Base {
    constructor(board) {
      this.board = board;
    }

    refresh() {
      this._evaluated = false;
    }

    updateEvaluation() {
      if (this._evaluated) {
        return;
      }
      let c = this.evaluate();
      if (this.board.strict) {
        c = !!c;
      }
      if (this.evaluation !== c) {
        Vue.set(this, "evaluation", c);
      }
      this._evaluated = true;
    }

    evaluate() {
      // ルールに則っていればtrue
      // ルールから逸脱していればfalse
      // 未定ならばnull
      return true;
    }
  }

  return Base;
});
