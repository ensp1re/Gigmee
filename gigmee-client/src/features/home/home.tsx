import { FC, ReactElement, useEffect } from "react";
import { ISellerGig } from "src/features/gigs/interfaces/gig.interface";
import { lowerCase } from "src/shared/utils/utils.service";
import { useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import { useGetRandomSellersQuery } from "src/features/seller/service/seller.service";
import {
  useGetGigsByCategoryQuery,
  useGetMoreGigsLikeThisQuery,
  useGetTopRatedGigsByCategoryQuery,
} from "src/features/gigs/service/gigs.service";
import { ISellerDocument } from "src/features/seller/interfaces/seller.interface";
import TopGigsView from "src/shared/gigs/TopGigsView";
import HomeSlider from "src/features/home/components/HomeSlider";
import HomeGigsView from "src/features/home/components/HomeGigsView";
import FeaturedExperts from "src/features/home/components/FeaturedExperts";
import { socketService } from "src/sockets/socket.service";

const Home: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { data, isSuccess } = useGetRandomSellersQuery("10");
  const { data: categoryData, isSuccess: isCategorySuccess } =
    useGetGigsByCategoryQuery(`${authUser?.username}`);
  const { data: topGigsData, isSuccess: isTopGigsSuccess } =
    useGetTopRatedGigsByCategoryQuery(`${authUser?.username}`);
  const { data: sellerData, isSuccess: isSellerDataSuccess } =
    useGetMoreGigsLikeThisQuery("66f7000d18bcce91126b7868");
  let sellers: ISellerDocument[] = [];
  let categoryGigs: ISellerGig[] = [];
  let topGigs: ISellerGig[] = [];

  if (isSuccess) {
    sellers = data.sellers as ISellerDocument[];
  }

  if (isCategorySuccess) {
    categoryGigs = categoryData.gigs as ISellerGig[];
  }

  if (isTopGigsSuccess) {
    topGigs = topGigsData.gigs as ISellerGig[];
  }

  if (isSellerDataSuccess) {
    topGigs = sellerData.gigs as ISellerGig[];
  }

  console.log(topGigs, "topGigs");

  useEffect(() => {
    socketService.setupSocketConnection();
  }, []);

  return (
    <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
      <HomeSlider />
      {topGigs.length > 0 && (
        <TopGigsView
          gigs={topGigs}
          title="Top rated services in"
          subTitle={`Highest rated talents for all your ${lowerCase(topGigs[0].categories)} needs.`}
          category={topGigs[0].categories}
          width="w-72"
          type="home"
        />
      )}
      {categoryGigs.length > 0 && (
        <HomeGigsView
          gigs={categoryGigs}
          title="Because you viewed a gig on"
          subTitle=""
          category={categoryGigs[0].categories}
        />
      )}
      <FeaturedExperts sellers={sellers} />
    </div>
  );
};

export default Home;
