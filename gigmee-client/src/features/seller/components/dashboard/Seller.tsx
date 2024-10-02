import { FC, ReactElement } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ISellerDocument } from '../../interfaces/seller.interface';
import { useGetSellerByIdQuery } from '../../service/seller.service';
import DashboardHeader from 'src/shared/header/component/DashboardHeader';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { useGetGigsBySellerIdQuery, useGetSellerPausedGigsQuery } from 'src/features/gigs/service/gigs.service';
import { useGetOrdersBySellerIdQuery } from 'src/features/order/services/order.service';

const Seller: FC = (): ReactElement => {
  const { sellerId } = useParams<string>();
  console.log(sellerId)
  const { data, isSuccess } = useGetSellerByIdQuery(`${sellerId}`);
  console.log(useGetSellerByIdQuery(`${sellerId}`))
  const { data: sellerGigs, isSuccess: isSellerGigsSuccess } = useGetGigsBySellerIdQuery(`${sellerId}`);
  const { data: sellerPausedGigs, isSuccess: isSellerPausedGigsSuccess } = useGetSellerPausedGigsQuery(`${sellerId}`);
  const { data: sellerOrders, isSuccess: isSellerOrdersSuccess } = useGetOrdersBySellerIdQuery(`${sellerId}`);
  
  let gigs: ISellerGig[] = [];
  let pausedGigs: ISellerGig[] = [];
  let orders: IOrderDocument[] = [];
  let seller: ISellerDocument | undefined = undefined;

  console.log(data)
  if (isSuccess) {
    seller = data?.seller as ISellerDocument;
  }

  if (isSellerGigsSuccess) {
    gigs = sellerGigs?.gigs as ISellerGig[];
  }

  if (isSellerPausedGigsSuccess) {
    pausedGigs = sellerPausedGigs?.gigs as ISellerGig[];
  }

  if (isSellerOrdersSuccess) {
    orders = sellerOrders?.orders as IOrderDocument[];
  }

  return (
    <div className="relative w-screen">
      <DashboardHeader />
      <div className="m-auto px-6 w-screen xl:container md:px-12 lg:px-6 relative min-h-screen">
        <Outlet context={{ seller, orders, gigs, pausedGigs }} />
      </div>
    </div>
  );
};

export default Seller;