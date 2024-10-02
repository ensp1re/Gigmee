import { FC, ReactElement, useEffect, useRef } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import StickyBox from "react-sticky-box";
import Rating from "src/shared/rating/Rating";
import {
  useGetGigByIdQuery,
  useGetMoreGigsLikeThisQuery,
} from "src/features/gigs/service/gigs.service";
import { useGetSellerByUsernameQuery } from "src/features/seller/service/seller.service";
import { ISellerGig } from "src/features/gigs/interfaces/gig.interface";
import { emptyGigData, emptySellerData } from "src/shared/utils/static-data";
import { ISellerDocument } from "src/features/seller/interfaces/seller.interface";
import {
  capitalizeFirstLetter,
  rating,
  shortenLargeNumbers,
} from "src/shared/utils/utils.service";
import PageLoader from "src/shared/pageloader/PageLoader";
import { GigContextType } from "src/features/gigs/context/GigContext";
import GigViewRight from "src/features/gigs/components/view/components/GigViewRight";
import GigViewLeft from "src/features/gigs/components/view/components/GigViewLeft";
import TopGigsView from "src/shared/gigs/TopGigsView";
import { useAppDispatch } from "src/store/store";
import { updateHeader } from "src/shared/header/reducers/header.reducer";

const GigView: FC = (): ReactElement => {
  const { gigId, username } = useParams<{ gigId: string; username: string }>();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updateHeader("home"));
  });

  const {
    data: gigData,
    isSuccess: isGigDataSuccess,
    isLoading: isGigLoading,
  } = useGetGigByIdQuery(gigId as string);

  const {
    data: sellerData,
    isSuccess: isSellerDataSuccess,
    isLoading: isSellerLoading,
  } = useGetSellerByUsernameQuery(capitalizeFirstLetter(username));

  const {
    data: moreGigData,
    isSuccess: isMoreGigDataSuccess,
    isLoading: isMoreGigLoading,
  } = useGetMoreGigsLikeThisQuery(gigId as string);

  const gig = useRef<ISellerGig>(emptyGigData);
  const seller = useRef<ISellerDocument>(emptySellerData);
  const moreGigs = useRef<ISellerGig[]>([]);

  if (isGigDataSuccess) {
    gig.current = gigData.gig as ISellerGig;
  }

  if (isSellerDataSuccess) {
    seller.current = sellerData.seller as ISellerDocument;
  }

  if (isMoreGigDataSuccess) {
    moreGigs.current = moreGigData.gigs as ISellerGig[];
  }

  const isLoading = isGigLoading && isSellerLoading && isMoreGigLoading;
  const isEmpty = !gigData?.gig || Object.keys(gigData.gig).length === 0;
  const navigator: NavigateFunction = useNavigate();

  if (isEmpty && !isLoading && !isGigLoading && !isSellerLoading) {
    return (
      <>
        {isLoading ? (
          <PageLoader />
        ) : (
          <section className="flex items-center h-screen w-screen p-16">
            <div className="container flex flex-col items-center ">
              <div className="flex flex-col gap-6 max-w-md text-center">
                <h2 className="font-extrabold text-9xl text-green-600 dark:text-green-600">
                  <span className="sr-only">Error</span>404
                </h2>
                <p className="text-2xl md:text-3xl dark:text-gray-300">
                  Sorry, we couldn't find this page.
                </p>
                <a
                  onClick={() => navigator("/")}
                  href="#"
                  className="px-8 py-4 text-xl font-semibold rounded bg-green-600 text-gray-50 hover:text-gray-200"
                >
                  Back to home
                </a>
              </div>
            </div>
          </section>
        )}
      </>
    );
  } else {
    return (
      <>
        {isLoading ? (
          <PageLoader />
        ) : (
          <main className="max-w-8xl container mx-auto mt-8">
            <h2 className="mb-4 px-4 text-xl font-bold text-[#404145] lg:text-3xl">
              {gig.current.title}
            </h2>
            <div className="mb-4 flex flex-row gap-x-2 px-4">
              <img
                className="flex h-8 w-8 self-center rounded-full object-cover"
                src={gig.current.profilePicture}
                alt={gig.current.username}
              />
              <span className="flex self-center font-extrabold">
                {gig.current.username}
              </span>
              <>
                {gig.current.ratingSum &&
                gig.current.ratingsCount &&
                gig.current.ratingSum >= 1 &&
                (gig.current.ratingsCount as number) >= 1 ? (
                  <>
                    <span className="flex self-center">|</span>
                    <div className="flex w-full gap-x-1 self-center">
                      <div className="mt-1 w-20 gap-x-2">
                        <Rating
                          value={rating(
                            gig.current.ratingSum / gig.current.ratingsCount,
                          )}
                          size={14}
                        />
                      </div>
                      <div className="ml-2 mt-[1px] flex gap-1 text-sm">
                        <span className="text-orange-400">
                          {rating(
                            gig.current.ratingSum / gig.current.ratingsCount,
                          )}
                        </span>
                        <span className="">
                          {shortenLargeNumbers(gig.current.ratingsCount)}{" "}
                          reviews
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            </div>

            <GigContextType.Provider
              value={{
                gig: gig.current,
                seller: seller.current,
                isSuccess: isGigDataSuccess,
                isLoading: isGigLoading,
              }}
            >
              <div className="flex flex-wrap">
                <div className="order-last w-full p-4 lg:order-first lg:w-2/3">
                  <GigViewLeft />
                </div>

                <div className="w-full p-4 lg:w-1/3 ">
                  <StickyBox offsetTop={10} offsetBottom={10}>
                    <GigViewRight />
                  </StickyBox>
                </div>
              </div>
            </GigContextType.Provider>
            {moreGigs.current.length > 0 && (
              <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
                <TopGigsView
                  title="Recommended for you"
                  subTitle="Based on your recent activity"
                  gigs={moreGigs.current}
                  type="home"
                  width="w-60"
                />
              </div>
            )}
          </main>
        )}
      </>
    );
  }
};

export default GigView;
