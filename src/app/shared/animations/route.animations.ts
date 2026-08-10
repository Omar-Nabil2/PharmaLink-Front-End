import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    // Both enter and leave must be absolute to prevent layout jumps.
    // They will sit on top of each other at top: 0, left: 0.
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      })
    ], { optional: true }),
    // Initial state for enter (hidden and moved down)
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' })
    ], { optional: true }),
    // Group ensures they run on a coordinated timeline
    group([
      // Leave element fades out quickly (200ms)
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ], { optional: true }),
      // Enter element waits 200ms (until leave is done), then fades in and moves up (300ms)
      query(':enter', [
        animate('300ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ])
]);
