import { ReactHTMLElement, ReactNode, useEffect, useRef } from "react";
import { cn } from "~/lib/util/cn";

type Props = {
  children: ReactNode;
  loadNext: () => any;
  isMore: boolean;
  onLoading?: ReactNode;
  onNoMore?: ReactNode;
  className?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >["className"];
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
  className,
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
  const loadNextIfNecessary = async () => {
    if (isMore && locked.current === false && isBoundaryInView()) {
      locked.current = true;
      await loadNext();
      locked.current = false;
    }
  };

  /**
   * Initial load, & load's more if a load does not fill element height
   */
  useEffect(() => {
    if (!locked.current) loadNextIfNecessary();
  }, [locked.current]);

  /**
   * If container is resized check if we should now load more elements
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(loadNextIfNecessary);
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef.current]);

  return (
    <div
      className={cn(
        className,
        "flex h-full w-full flex-col gap-3 overflow-y-scroll scrollbar-hide",
      )}
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
