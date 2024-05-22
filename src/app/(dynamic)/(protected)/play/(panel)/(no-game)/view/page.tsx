import Panel from "../../_components/Panel";
import SummaryInfiniteScroll from "~/app/_components/game/summary/SummaryInfiniteScroll";

export default async function ViewRetrospectiveGame() {
  return (
    <Panel subtitle="view game" goBackTo="/play">
      <div className="h-96">
        <SummaryInfiniteScroll />
      </div>
    </Panel>
  );
}
