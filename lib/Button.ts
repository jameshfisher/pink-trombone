export function nullButton(switchedOn: boolean): ButtonT {
  return {
    x: null,
    y: null,
    width: null,
    height: null,
    text: null,
    switchedOn: switchedOn,
    draw: function (ctx) {},
    drawText: function (ctx) {},
    handleTouchStart: function (touch) {},
  };
}
