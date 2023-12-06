export function nullButton(switchedOn: boolean): ButtonT {
  return {
    x: null,
    y: null,
    width: null,
    height: null,
    text: null,
    switchedOn: switchedOn,
    draw: function (_ctx) {},
    drawText: function (_ctx) {},
    handleTouchStart: function (_touch) {},
  };
}
