console.log("hi");
let hUnit = 100;
let wUnit = 100;
var draw = SVG()
  .addTo("#braid")
  .size("100%", "100%");
console.log(draw);

const BACKGROUND_COLOR = "#F2AB6D",
  BRAID_COLOR = "#A64B63",
  YELLOW = "#F2D888",
  ORANGE = "#F2785C",
  PINK = "#F26666",
  BRUSH_WIDTH = 6;

const gradient1 = draw.gradient("linear", function(add) {
  add.stop(0, YELLOW);
  add.stop(1, BACKGROUND_COLOR);
});

const gradient2 = draw.gradient("linear", function(add) {
  add.stop(0, BACKGROUND_COLOR);
  add.stop(1, ORANGE);
});

const gradient3 = draw.gradient("linear", function(add) {
  add.stop(0, ORANGE);
  add.stop(1, PINK);
});

const gradient = draw.gradient("linear", function(add) {
  add.stop(0, PINK);
  add.stop(1, BRAID_COLOR);
});

function cross(strand1, strand2) {
  let s1 = strand1;
  let s2 = strand2;
  let over = true;
  if (s1.data("top") > s2.data("top")) {
    [s1, s2] = [s2, s1];
  }
  drawCrossing(x, y, over);
}

class Crossing {
  constructor(x, y, crossOver = true) {
    console.log('created');
    this.x = x;
    this.y = y;
    let makeOver = crossUp;
    let makeUnder = crossDown;
    if (crossOver) {
      [makeOver, makeUnder] = [makeUnder, makeOver];
    }
    this.under = makeUnder(x, y);
    this.circle = drawcricle(x, y);
    this.over = makeOver(x, y);

    this.addClickAction();
  }

  swapFront() {
      console.log('yes');
    $(this.circle).detach().appendTo($('#braid > svg'));
    $(this.under).detach().appendTo($('#braid > svg'));
    console.log($(this.circle));
    [this.over, this.under] = [this.under, this.over];

    this.addClickAction();
  }

  addClickAction() {
    unclick();
    let self = this;
    $(this.under).off('click').click(()=>{
        self.swapFront.call(self);
    });
    $(this.over).off('click').click(()=>{
        self.uncross.call(self);
    });
  }

  uncross() {
    unclick();
    $(this.over)
      .add(this.under)
      .add(this.circle)
      .remove();
    drawStrand(this.x, this.y);
    drawStrand(this.x, this.y + hUnit);
  }
}

function drawcricle(x, y) {
  const rad = wUnit / 6;

  let circle = draw
    .circle(rad)
    .fill(BACKGROUND_COLOR)
    .center(x + wUnit / 2, y + hUnit / 2)
    .dmove(BRUSH_WIDTH, BRUSH_WIDTH);
  return circle.node;
}

function crossDown(x, y) {
  const path = draw
    .path(`M0 0 C${wUnit / 2} ${0} ${wUnit / 2} ${hUnit} ${wUnit} ${hUnit}`)
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

function crossUp(x, y) {
  const path = draw
    .path(`M0 0 C${wUnit / 2} ${0} ${wUnit / 2} ${-hUnit} ${wUnit} ${-hUnit}`)
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

let clickedStrand;

function drawStrand(x, y) {
  let line = draw
    .path(`M0 0 h ${wUnit}`)
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
      addClickAbility(node);
}

function addClickAbility(node) {
  $(node).click(() => {
    console.log(clickedStrand);
    console.log(node);
    if (clickedStrand) {
      let otherStrand = $(clickedStrand);
      unclick();
      const x1 = $(node).data("x");
      const x2 = $(otherStrand).data("x");
      console.log(x1);
      console.log(x2);
      if (x1 === x2) {
        console.log('1');
        let y1 = $(node).data("y");
        let y2 = $(otherStrand).data("y");
        if (y1 < y2) {
            console.log('2');
          [y1, y2] = [y2, y1];
        }
        console.log((y1 - y2)/hUnit);
        if ((y1 - y2)/hUnit === 1) {
            console.log('3');

          new Crossing(x1, y1 - hUnit);
          $(node)
            .add(otherStrand)
            .remove();
          unclick();
          return;
        }
      }
    }
    clickedStrand = node;
    $(node).click(unclick);
  });
}

function unclick() {
  if (!clickedStrand) return;
  addClickAbility(clickedStrand);
  clickedStrand = null;
}

function drawBraid(numStrands, numCrossings) {
  hUnit = ($("#braid").height() - BRUSH_WIDTH * numStrands) / (numStrands - 1);
  wUnit = ($("#braid").width() - BRUSH_WIDTH * 2) / numCrossings;
  for (let s = 0; s < numStrands; s++) {
    for (let c = 0; c < numCrossings; c++) {
      const x = c * wUnit;
      const y = s * hUnit;
      drawStrand(x, y);

      drawEnds(x, y);
    }
    drawEnds(numCrossings * wUnit, s * hUnit);
  }
}

function drawEnds(x, y) {
  draw
    .circle(10)
    .fill(BRAID_COLOR)
    .center(x, y)
    .dmove(BRUSH_WIDTH, BRUSH_WIDTH);
}

let $strandsSelector = $("#numStrands");
let $crossingsSelector = $("#numCrossings");

$strandsSelector.add($crossingsSelector).change(function() {
  draw.clear();
  drawBraid($strandsSelector.val(), $crossingsSelector.val());
});

drawBraid($strandsSelector.val(), $crossingsSelector.val());
