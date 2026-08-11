import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    // Only the leaving element is taken out of flow.
    // The entering element dictates the container height immediately, 
    // preventing the footer from collapsing to the top.
    query(':leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        display: 'block'
      })
    ], { optional: true }),
    // Initial state for enter (hidden and moved down)
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)', display: 'block' })
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
