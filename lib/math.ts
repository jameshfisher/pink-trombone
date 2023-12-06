export const clamp = function (number: number, min: number, max: number) {
  if (number < min) return min;
  else if (number > max) return max;
  else return number;
};

export const moveTowards = function (
  current: number,
  target: number,
  amountUp: number,
  amountDown: number
) {
  if (current < target) return Math.min(current + amountUp, target);
  else return Math.max(current - amountDown, target);
};

export const gaussian = function () {
  var s = 0;
  for (var c = 0; c < 16; c++) s += Math.random();
  return (s - 8) / 4;
};
