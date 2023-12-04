Math.clamp = function (number: number, min: number, max: number) {
  if (number < min) return min;
  else if (number > max) return max;
  else return number;
};

Math.moveTowards = function (current, target, amountUp, amountDown) {
  if (current < target) return Math.min(current + amountUp, target);
  else return Math.max(current - amountDown, target);
};

Math.gaussian = function () {
  var s = 0;
  for (var c = 0; c < 16; c++) s += Math.random();
  return (s - 8) / 4;
};
