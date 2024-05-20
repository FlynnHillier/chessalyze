import { ReactNode, useEffect, useRef } from "react";

type Props = {
  children: ReactNode;
  loadNext: (onLoaded: () => any) => any;
  isMore: boolean;
  isLoading: boolean;
};

//TODO: do not load first elements twice.

/**
 * Support 'infinite scroll' effect.
 *
 */
export default function InfiniteScroller({
  children,
  loadNext,
  isMore,
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
    loadNextIfNecessary();
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-scroll "
      onScroll={loadNextIfNecessary}
      ref={containerRef}
    >
      <div className="flex h-fit w-full flex-col flex-wrap gap-2">
        {children}
        <span ref={triggerRef} />
        {isMore ? "loading more stuff..." : "youve reached the end!"}
      </div>
    </div>
  );
}
