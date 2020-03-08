define(function(require) {
  return cell => {
    class Module extends cell {
      imagesBorder(images) {
        if (this.wleft) {
          images.push("lborder");
        }
        if (this.wtop) {
          images.push("tborder");
        }
        if (this.wright) {
          images.push("rborder");
        }
        if (this.wbottom) {
          images.push("bborder");
        }
      }

      get wright() {
        const cell = this.cell(1, 0);
        return cell.wall || cell.wleft;
      }

      get wbottom() {
        const cell = this.cell(0, 1);
        return cell.wall || cell.wtop;
      }
    }
    return Module;
  };
});
