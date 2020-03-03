
const BACKGROUND_COLOR = "#1d1c25",
YELLOW_ORANGE = "#F2AB6D",
BRAID_COLOR = "#A64B63",
YELLOW = "#F2D888",
ORANGE = "#F2785C",
PINK = "#F26666",
BRUSH_WIDTH = 6;


class Braid {
  constructor(ctx) {
    this.$div = $(ctx);
    this.hUnit = 100;
    this.wUnit = 100;
    this.draw = SVG()
      .addTo(ctx)
      .size("100%", "100%");
    let braid = this;

    this.gradient = this.draw.gradient("linear", function(add) {
      add.stop(.2, BRAID_COLOR);
      add.stop(.5, PINK);
      add.stop(.8, BRAID_COLOR);
      });

      this.gradient.attr({'gradientUnits': "userSpaceOnUse", 'x1': "0%",'y1': '0%', 'x2': "100%", 'y2':"0%"});

    this.$strandsSelector = this.$div.find(".numStrands");
    this.$crossingsSelector = this.$div.find(".numCrossings");

    this.$strandsSelector.add(this.$crossingsSelector).change(function() {
      braid.draw.clear();
      braid.drawBraid.call(braid, braid.$strandsSelector.val(), braid.$crossingsSelector.val());
    });

    this.drawBraid(braid.$strandsSelector.val(), braid.$crossingsSelector.val());
    this.Crossing = class Crossing {
      constructor(x, y, crossOver = true) {
        this.x = x;
        this.y = y;
        let makeOver = braid.crossUp;
        let makeUnder = braid.crossDown;
        if (crossOver) {
          [makeOver, makeUnder] = [makeUnder, makeOver];
        }
        this.under = makeUnder.call(braid, x, y);
        this.circle = braid.drawcricle.call(braid, x, y);
        this.over = makeOver.call(braid, x, y);

        this.addClickAction();
      }

      swapFront() {
        $(this.circle)
          .detach()
          .appendTo(braid.$div.children("svg"));
        $(this.under)
          .detach()
          .appendTo(braid.$div.children("svg"));
        [this.over, this.under] = [this.under, this.over];

        this.addClickAction();
      }

      addClickAction() {
        braid.unclick.call(braid);
        let self = this;
        $(this.under)
          .off("click")
          .click(() => {
            self.swapFront.call(self);
          });
        $(this.over)
          .off("click")
          .click(() => {
            self.uncross.call(self);
          });
      }

      uncross() {
        braid.unclick.call(braid);
        $(this.over)
          .add(this.under)
          .add(this.circle)
          .remove();
        braid.drawStrand.call(braid, this.x, this.y);
        braid.drawStrand.call(braid, this.x, this.y + braid.hUnit);
      }
    };
  }

  cross(strand1, strand2) {
    let s1 = strand1;
    let s2 = strand2;
    let over = true;
    if (s1.data("top") > s2.data("top")) {
      [s1, s2] = [s2, s1];
    }
    this.drawCrossing(x, y, over);
  }

  drawcricle(x, y) {
    const rad = this.wUnit / 6;

    let circle = this.draw
      .circle(rad)
      .fill(BACKGROUND_COLOR)
      .center(x + this.wUnit / 2, y + this.hUnit / 2)
      .dmove(BRUSH_WIDTH, BRUSH_WIDTH);
    return circle.node;
  }

  crossDown(x, y) {
    const path = this.draw
      .path(
        `M0 0 C${this.wUnit / 2} ${0} ${this.wUnit / 2} ${this.hUnit} ${
          this.wUnit
        } ${this.hUnit}`
      )
      .fill("none")
      .stroke({
        color: BRAID_COLOR,
        width: BRUSH_WIDTH,
        linecap: "round",
        linejoin: "round"
      })
      .move(x, y)
      .dmove(BRUSH_WIDTH, BRUSH_WIDTH);

    return path.node;
  }

  crossUp(x, y) {
    const path = this.draw
      .path(
        `M0 0 C${this.wUnit / 2} ${0} ${this.wUnit / 2} ${-this.hUnit} ${
          this.wUnit
        } ${-this.hUnit}`
      )
      .fill("none")
      .stroke({
        color: BRAID_COLOR,
        width: BRUSH_WIDTH,
        linecap: "round",
        linejoin: "round"
      })
      .move(x, y)
      .dmove(BRUSH_WIDTH, BRUSH_WIDTH);

    return path.node;
  }


  drawStrand(x, y) {
    let line = this.draw
      .line(0, 0, this.wUnit, 0) //path doesn't work w/ gradient
      .fill("none")
      .stroke({
        color: BRAID_COLOR,
        width: BRUSH_WIDTH,
        linecap: "round",
        linejoin: "round"
      })
      .move(x, y)
      .dmove(BRUSH_WIDTH, BRUSH_WIDTH);
    let node = line.node;
    $(node).data({ x: x, y: y });
    this.addClickAbility(node);
  }

  addClickAbility(node) {
    let braid = this;
    $(node).click(() => {
      if (braid.clickedStrand) {
        let otherStrand = $(braid.clickedStrand);
        braid.unclick.call(braid);
        const x1 = $(node).data("x");
        const x2 = $(otherStrand).data("x");
        if (x1 === x2) {
          let y1 = $(node).data("y");
          let y2 = $(otherStrand).data("y");
          if (y1 < y2) {
            [y1, y2] = [y2, y1];
          }
          if ((y1 - y2) / braid.hUnit === 1) {
            new braid.Crossing(x1, y1 - braid.hUnit);
            $(node)
              .add(otherStrand)
              .remove();
            braid.unclick.call(braid);
            return;
          }
        }
      }
      braid.clickedStrand = node;
      $(node).attr('stroke', PINK);
      $(node).click(braid.unclick.bind(braid));
    });
  }

  unclick() {
    if (!this.clickedStrand) return;
    this.$div.find('svg path').attr('stroke', BRAID_COLOR);
    this.addClickAbility(this.clickedStrand);
    this.clickedStrand = null;
  }

  drawBraid(numStrands, numCrossings) {
    const $svg = this.$div.children('svg');
    this.hUnit =
      ($svg.height() - BRUSH_WIDTH * numStrands) / (numStrands - 1);
    this.wUnit = ($svg.width() - BRUSH_WIDTH * 2) / numCrossings;
    for (let s = 0; s < numStrands; s++) {
      for (let c = 0; c < numCrossings; c++) {
        const x = c * this.wUnit;
        const y = s * this.hUnit;
        this.drawStrand(x, y);

        this.drawEnds(x, y);
      }
      this.drawEnds(numCrossings * this.wUnit, s * this.hUnit);
    }
  }

  drawEnds(x, y) {
    this.draw
      .circle(10)
      .fill(BRAID_COLOR)
      .center(x, y)
      .dmove(BRUSH_WIDTH, BRUSH_WIDTH);
  }

  drawTrace() {
    this.$closureBtn = this.$div.children(".closure");
    this.
    $strandsSelector.change(redrawTrace);
    function redrawTrace() {
      strandCount = $strandsSelector.val();
  
      for (let i = 0; i < strandCount; i++) {
        draw.path();
      }
    }
  
    redrawTrace();
  }
}


new Braid("#braid");

///////Slider//////////////// (credit https://codepen.io/form-and-function/pen/ZEGLVzw?editors=1111)

function addSliderFunctionality() {
  const classbaseName = "bColor";
  const colors = [];
  const colorCount = 5;
  for (let i = 1; i <= colorCount; i++) {
    const colorString = classbaseName + i;
    colors.push(colorString);
  }
  const colorsStr = colors.join(" ");

  for (let i = 1; i < colorCount - 1; i++) {
    const idx = i * 2 - 1;
    colors.splice(idx, 0, colors[idx]);
  }

  const $inputRanges = $("input[type=range]").each(colorSlider);

  // move gradient
  $inputRanges.on("input", colorSlider);

  function colorSlider() {
    const $inputRange = $(this);
    const min = $inputRange.attr("min");
    const max = $inputRange.attr("max") - min;
    const idx = Math.floor((($inputRange.val() - min) * colors.length) / max);
    console.log(idx);
    const last = colors[colors.length - 1];
    $inputRange.removeClass(colorsStr).addClass(colors[idx] || last);
  }
}

addSliderFunctionality();

///cool lines///

function calculateLayout() {
  const y1 = $("#title1").height() * 0.744 + $("#title1").offset().top;
  $("#line1").height(y1);

  const x1 = $("#line1").offset().left;
  const x2 = $("#title1").offset().left - x1;
  console.log($("#title1"));
  $("#line2")
    .css({ left: x1, top: y1 })
    .outerWidth(x2);

  const x3 = $("#title1").offset().left + $("#title1").width();
  const x4 = $("#box1").offset().left + $("#box1").outerWidth() - x3;
  $("#line3")
    .css({ left: x3, top: y1 })
    .outerWidth(x4);
  const y2 = $("#box1").offset().top + $("#box1").outerHeight() - y1;
  $("#line4")
    .css({ left: x4 + x3, top: y1 })
    .height(y2);
  const lineW = 50;
  const x5 = $("#braid svg").offset().left + $("#braid svg").width() + lineW;
  const x6 = x4 + x3 - x5 + BRUSH_WIDTH;

  $("#line5")
    .css({ left: x5, top: y1 + y2 })
    .outerWidth(x6);

  const y3 = $("#braid svg").offset().top - y1 - y2 + BRUSH_WIDTH / 2;
  $("#line6")
    .css({ left: x5, top: y1 + y2 })
    .height(y3);

  $("#line7")
    .css({ left: x5 - lineW - BRUSH_WIDTH, top: y1 + y2 + y3 })
    .outerWidth(lineW + BRUSH_WIDTH * 2);
}

calculateLayout();

$(window).resize(calculateLayout);
