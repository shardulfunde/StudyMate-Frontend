const DELAY_CLASSES = [
  'motion-delay-0',
  'motion-delay-75',
  'motion-delay-150',
  'motion-delay-225',
  'motion-delay-300',
  'motion-delay-450'
];

export function staggerDelayClass(index = 0) {
  return DELAY_CLASSES[index % DELAY_CLASSES.length];
}

export function questionTransitionClass(direction = 'next') {
  if (direction === 'prev') {
    return 'animate-fadeInUp';
  }
  return 'animate-softPop';
}
