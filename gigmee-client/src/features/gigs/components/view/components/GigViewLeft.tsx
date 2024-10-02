import { FC, ReactElement } from "react";
import GigOverview from "./GigViewLeft/GigOverview";
import GigAbout from "./GigViewLeft/GigAbout";
import GigViewReviews from "./GigViewLeft/GigViewReviews";

const GigViewLeft: FC = (): ReactElement => {
  return (
    <>
      <GigOverview />
      <GigAbout />
      <GigViewReviews showRatings={true} hasFetchedReviews={false} />
    </>
  );
};

export default GigViewLeft;
