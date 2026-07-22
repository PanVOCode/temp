# Fullscreen Scroll Audit

Generated: 2026-07-22T07:53:25.077Z

✓ scroll down through entire site
  down: hero → services → projects → partners-c → process-step → process-step → process-step → process-step → specs → cta
  Status: passed
  Video: ./test-results/fullscreen-scroll/scroll-down-full-site/video.webm

✓ scroll up through entire site
  up: cta → specs → process-step → process-step → process-step → process-step → partners-c → projects → projects → projects → projects → services → hero
  Status: passed
  Video: ./test-results/fullscreen-scroll/scroll-up-full-site/video.webm

✓ round trip through entire site
  round-trip: hero → services → projects → partners-c → process-step → process-step → process-step → process-step → specs → cta ↑ cta → specs → process-step → process-step → process-step → process-step → partners-c → projects → projects → projects → projects → services → hero
  Status: passed
  Video: ./test-results/fullscreen-scroll/round-trip-full-site/video.webm

✓ full scroll down with large wheel deltas
  large-delta: 12 steps to cta
  Status: passed
  Video: ./test-results/fullscreen-scroll/full-scroll-large-delta/video.webm

✓ full scroll down with trackpad inertia bursts
  inertia: hero → services → projects → partners-c → process-step → process-step → process-step → process-step → specs → cta
  Status: passed
  Video: ./test-results/fullscreen-scroll/full-scroll-inertia/video.webm

✓ full scroll respects boundaries at top and bottom
  boundaries: top=hero, bottom=cta
  Status: passed
  Video: ./test-results/fullscreen-scroll/full-scroll-boundaries/video.webm

✓ mouse wheel responds immediately after transition
  Status: passed
  Video: ./test-results/fullscreen-scroll/mouse-wheel-responds-immediately-after-transition/video.webm

✓ long trackpad tail remains one gesture
  Status: passed
  Video: ./test-results/fullscreen-scroll/long-trackpad-tail-remains-one-gesture/video.webm

## Summary

Passed: 8/8

Criterion: site scrolls through entirely from top to bottom.