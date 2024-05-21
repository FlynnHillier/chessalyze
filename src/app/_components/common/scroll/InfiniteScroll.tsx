import { ReactNode, useEffect, useRef } from "react";

type Props = {
  children: ReactNode;
  loadNext: (onLoaded: () => any) => any;
  isMore: boolean;
  onLoading?: ReactNode;
  onNoMore?: ReactNode;
};

/**
 * Support 'infinite scroll' effect.
 *
 */
export default function InfiniteScroller({
  children,
  loadNext,
  isMore,
  onLoading,
  onNoMore,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const locked = useRef<boolean>(false);

  /**
   *
   * @returns true if the bottom of the container is in view.
   */
  const isBoundaryInView: () => boolean = () => {
    if (!triggerRef.current || !containerRef.current) return false;

    const containerRect = containerRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();

    return (
      triggerRect.top >= containerRect.top &&
      triggerRect.top + triggerRect.height <=
        containerRect.top + containerRect.height
    );
  };

  /**
   *
   * call the loadNext prop if the bottom of the scrollable container is in view and there are still more elements to be loaded
   */
  const loadNextIfNecessary = () => {
    if (isMore && locked.current === false && isBoundaryInView()) {
      locked.current = true;
      loadNext(() => {
        locked.current = false;
      });
    }
  };

  useEffect(() => {
    if (!locked.current) loadNextIfNecessary();
  }, [locked.current]);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-y-scroll scrollbar-hide"
      onScroll={loadNextIfNecessary}
      ref={containerRef}
    >
      <div className="flex h-fit w-full flex-row flex-wrap justify-center gap-2">
        {children}
        <span ref={triggerRef} />
      </div>
      {isMore ? onLoading : onNoMore}
    </div>
  );
}
