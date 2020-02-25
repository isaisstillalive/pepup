define(function() {
  return {
    board: {
      data: {
        test: "teset"
      },
      created() {
        this.map = [
          [9,9,0,5,5,5,0,9,9,9],
          [9,9,9,9,1,9,9,9,9,9],
          [5,9,9,9,1,9,9,9,9,9],
          [5,9,0,5,5,5,0,9,9,0],
          [5,9,9,9,1,9,9,9,9,9],
          [9,9,9,9,1,9,9,9,9,9],
          [9,9,0,5,5,5,0,9,9,1],
          [5,9,9,5,9,9,9,9,9,9],
          [9,9,9,9,9,9,1,9,9,1],
          [1,9,9,5,5,5,5,5,9,9],
          [9,9,9,9,9,1,9,9,9,9],
          [9,9,9,9,9,1,9,9,9,5],
          [1,9,9,0,5,5,5,2,9,5],
          [9,9,9,9,9,1,9,9,9,5],
          [9,9,9,9,9,1,9,9,9,9],
          [9,9,9,0,5,5,5,0,9,9],
        ];

        for (let y = 0; y < this.map.length; y++) {
          for (let x = 0; x < this.map[y].length; x++) {
            const element = this.map[y][x];
            if (element >= 0 && element <= 4) {
              this.map[y][x] = {
                type: 'wall',
                number: element
              }
            } else if (element == 5) {
              this.map[y][x] = {
                type: 'wall',
                number: null
              }
            } else {
              this.map[y][x] = {
                type: 'floor',
                light: false,
                none: false,
                bright: 0
              }
            }
          }
        }
      },
    },
    cell: {
      methods: {
        click(){
          if (this.current.type != 'floor') {
            return;
          }
          if (this.light) {
            this.light = false;
            this.none = true;
          } else if (this.none) {
            this.none = false;
          } else {
            this.light = true;
          }
        },
        cell(x,y) {
          if (this.map[y] == undefined) {
            return {type: 'wall'};
          }
          if (this.map[y][x] == undefined) {
            return {type: 'wall'};
          }
          return this.map[y][x];
        },
        changeBright(addx, addy, value){
          let x = this.x + addx;
          let y = this.y + addy;
          while (true) {
            const cell = this.cell(x,y);
            if (cell.type == 'wall') {
              break;
            }
            cell.bright += value ? 1 : -1;
            x += addx;
            y += addy;
          }
        }
      },
      computed: {
        light: {
          get(){
            return this.current.light;
          },
          set(value){
            this.current.light = value;
            this.current.bright += value ? 1 : -1;

            this.changeBright(1, 0, value);
            this.changeBright(-1, 0, value);
            this.changeBright(0, 1, value);
            this.changeBright(0, -1, value);

            // 配列の更新を反映する
            this.$set(this.map, 0, this.map[0]);
          }
        },
        none: {
          get(){
            return this.current.none;
          },
          set(value){
            this.current.none = value;
            // 配列の更新を反映する
            this.$set(this.map, 0, this.map[0]);
          }
        },
        current() {
          return this.map[this.y][this.x];
        },
        arounds(){
          let result = {
            light: 0,
            filled: 0,
          };

          const arounds = [
            [-1,0],
            [1,0],
            [0,-1],
            [0,1],
          ];
          for (const around of arounds) {
            const cell = this.cell(this.x + around[0],this.y + around[1]);
            if (cell.type == 'wall' || cell.none) {
              result.filled += 1;
            } else if (cell.bright >= 1) {
              result.filled += 1;
              if (cell.light) {
                result.light += 1;
              }
            }
          }

          result.filled = (result.filled == 4);

          return result;
        },
        images() {
          const images = [];
          if (this.current.type == 'wall') {
            if (this.current.number == null) {
              images.push({
                src: 'mode/akari/img/wall.png'
              });
            } else {
              images.push({
                src: `mode/akari/img/wall${this.current.number}.png`
              });
              const arounds = this.arounds;

              if (arounds.filled) {
                if (arounds.light == this.current.number) {
                  images.push({
                    src: 'mode/akari/img/ruleok.png'
                  });
                } else {
                  images.push({
                    src: 'mode/akari/img/ruleng.png'
                  });
                }
              } else if (arounds.light > this.current.number) {
                images.push({
                  src: 'mode/akari/img/ruleng.png'
                });
              }
            }
          } else if (this.current.type == 'floor') {
            images.push({
              src: 'mode/akari/img/floor.png'
            });
            if (this.current.bright >= 1) {
              images.push({
                src: 'mode/akari/img/bright.png'
              });
            }
            if (this.current.light) {
              images.push({
                src: 'mode/akari/img/light.png'
              });
              if (this.current.bright >= 2) {
                images.push({
                  src: 'mode/akari/img/ruleng.png'
                });
              }
            }
            if (this.current.none) {
              images.push({
                src: 'mode/akari/img/none.png'
              });
            }
          }
          return images;
        }
      }
    }
  };
});