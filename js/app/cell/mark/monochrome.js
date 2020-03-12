define(function(require) {
  return cell => {
    class Module extends cell {
      changeToWhite(change) {
        if (this.mark != -1) {
          change.mark = -1;
          return true;
        }
        change.mark = null;
        return true;
      }

      changeToBlack(change) {
        if (this.mark != 1) {
          change.mark = 1;
          return true;
        }
        change.mark = null;
        return true;
      }

      imagesMonochrome(images) {
        if (this.mark == 1) {
          images.push("black");
        } else if (this.mark == -1) {
          images.push("white");
        } else {
          images.push("floor");
        }
      }
    }
    return Module;
  };
});
