import { Directive, ElementRef, HostListener, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appDragScroll]',
  standalone: true
})
export class DragScrollDirective implements OnDestroy {
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialScrollLeft = 0;
  private initialScrollTop = 0;
  private removeListeners: Array<() => void> = [];
  private removeWheelListener?: () => void;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone
  ) {
    this.registerWheelHandler();
    this.observeOverflow();
  }

  ngOnDestroy(): void {
    this.cleanupListeners();
    this.removeWheelListener?.();
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0 || this.shouldIgnore(event.target)) {
      return;
    }

    event.preventDefault();
    this.startDrag(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.shouldIgnore(event.target)) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    event.preventDefault();
    this.startDrag(touch.clientX, touch.clientY);
  }

  private startDrag(x: number, y: number): void {
    const element = this.elementRef.nativeElement;
    this.isDragging = true;
    this.startX = x;
    this.startY = y;
    this.initialScrollLeft = element.scrollLeft;
    this.initialScrollTop = element.scrollTop;

    element.classList.add('is-dragging');
    element.style.cursor = 'grabbing';

    this.registerListeners();
  }

  private registerListeners(): void {
    this.cleanupListeners();

    this.ngZone.runOutsideAngular(() => {
      const moveMouse = (event: MouseEvent) => {
        if (!this.isDragging) {
          return;
        }
        event.preventDefault();
        this.updateScroll(event.clientX, event.clientY);
      };

      const upMouse = () => this.finishDrag();

      const moveTouch = (event: TouchEvent) => {
        if (!this.isDragging) {
          return;
        }
        const touch = event.touches[0];
        if (!touch) {
          return;
        }
        event.preventDefault();
        this.updateScroll(touch.clientX, touch.clientY);
      };

      const endTouch = () => this.finishDrag();

      window.addEventListener('mousemove', moveMouse, { passive: false });
      window.addEventListener('mouseup', upMouse, { passive: true });
      window.addEventListener('touchmove', moveTouch, { passive: false });
      window.addEventListener('touchend', endTouch, { passive: true });
      window.addEventListener('touchcancel', endTouch, { passive: true });

      this.removeListeners = [
        () => window.removeEventListener('mousemove', moveMouse),
        () => window.removeEventListener('mouseup', upMouse),
        () => window.removeEventListener('touchmove', moveTouch),
        () => window.removeEventListener('touchend', endTouch),
        () => window.removeEventListener('touchcancel', endTouch)
      ];
    });
  }

  private finishDrag(): void {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.cleanupListeners();
    const element = this.elementRef.nativeElement;
    element.classList.remove('is-dragging');
    element.style.cursor = '';
    this.updateOverflowState(element);
  }

  private updateScroll(x: number, y: number): void {
    const element = this.elementRef.nativeElement;
    const deltaX = x - this.startX;
    const deltaY = y - this.startY;
    element.scrollLeft = this.initialScrollLeft - deltaX;
    element.scrollTop = this.initialScrollTop - deltaY;
    this.updateOverflowState(element);
  }

  private cleanupListeners(): void {
    if (!this.removeListeners.length) {
      return;
    }
    this.removeListeners.forEach((remove) => remove());
    this.removeListeners = [];
  }

  private shouldIgnore(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return !!target.closest('button, a, input, textarea, select, label');
  }

  private registerWheelHandler(): void {
    this.ngZone.runOutsideAngular(() => {
      const element = this.elementRef.nativeElement;

      const handleWheel = (event: WheelEvent) => {
        const scrollWidth = element.scrollWidth || 0;
        const clientWidth = element.clientWidth || 0;
        const hasOverflow = scrollWidth > clientWidth + 1;

        if (!hasOverflow) {
          return;
        }

        let deltaValue = 0;
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          deltaValue = event.deltaY;
        } else {
          deltaValue = event.deltaX;
        }

        if (deltaValue === 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const scrollStep = deltaValue * (event.shiftKey ? 1.5 : 1);
        const currentScroll = element.scrollLeft || 0;
        const maxScroll = Math.max(0, scrollWidth - clientWidth);
        const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollStep));

        element.scrollLeft = newScroll;
      };

      element.addEventListener('wheel', handleWheel, { passive: false });
      this.removeWheelListener = () => element.removeEventListener('wheel', handleWheel);
    });
  }

  private observeOverflow(): void {
    const element = this.elementRef.nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        const hasOverflow = element.scrollWidth > element.clientWidth + 1;
        element.classList.toggle('drag-scroll--overflow', hasOverflow);
      });
      this.resizeObserver.observe(element);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        const hasOverflow = element.scrollWidth > element.clientWidth + 1;
        element.classList.toggle('drag-scroll--overflow', hasOverflow);
      });
      this.mutationObserver.observe(element, { subtree: true, childList: true, attributes: true });
    }
  }

  private updateOverflowState(element: HTMLElement): void {
    const hasOverflow = element.scrollWidth > element.clientWidth + 1;
    element.classList.toggle('drag-scroll--overflow', hasOverflow);
  }
}
