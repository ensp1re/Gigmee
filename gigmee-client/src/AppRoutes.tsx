import { FC, lazy, LazyExoticComponent, ReactNode, Suspense } from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import NotFound from "src/shared/NotFound";
import ProtectedRoutes from "src/features/ProtectedRoutes";
import BuyerDashboard from "src/features/buyer/components/BuyerDashboard";
import AddSeller from "src/features/seller/components/add/AddSeller";
import CurrentSellerProfile from "src/features/seller/components/profile/currentSellerProfile";
import SellerProfile from "src/features/seller/components/profile/SellerProfile";
import Seller from "src/features/seller/components/dashboard/Seller";
import ManageEarnings from "src/features/seller/components/dashboard/ManageEarnings";
import ManageOrders from "src/features/seller/components/dashboard/ManageOrders";
import SellerDashboard from "src/features/seller/components/dashboard/SellerDashboard";
import AddGig from "src/features/gigs/components/gig/AddGig";
import GigView from "src/features/gigs/components/view/GigView";
import { IGigsProps } from "src/features/gigs/interfaces/gig.interface";
import Home from "src/features/home/home";
import EditGig from "src/features/gigs/components/gig/EditGig";
import Chat from "src/features/chat/components/Chat";
import Checkout from "src/features/order/compontents/Checkout";
import Requirement from "src/features/order/compontents/checkout-form/Requirement";
import Order from "./features/order/compontents/Order";
import Settings from "./features/settings/components/Settings";

const ResetPassword: LazyExoticComponent<FC> = lazy(
  () => import("src/features/auth/components/ResetPassword"),
);
const ConfirmEmail: LazyExoticComponent<FC> = lazy(
  () => import("src/features/auth/components/ConfirmEmail"),
);
const AppPage: LazyExoticComponent<FC> = lazy(
  () => import("src/features/AppPage"),
);
const Gigs: LazyExoticComponent<FC<IGigsProps>> = lazy(
  () => import("src/features/gigs/components/gigs/Gigs"),
);

const Layout = ({
  backgroundColor = "#fff",
  children,
}: {
  backgroundColor: string;
  children: ReactNode;
}): JSX.Element => (
  <div style={{ backgroundColor }} className="flex flex-grow">
    {children}
  </div>
);

const AppRouter: FC = () => {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: (
        <Suspense>
          <AppPage />
        </Suspense>
      ),
    },
    {
      path: "/",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Home />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/users/:username/:buyerId/orders",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <BuyerDashboard />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/seller_onboarding",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <AddSeller />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/seller_profile/:username/:sellerId/edit",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <CurrentSellerProfile />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/seller_profile/:username/:sellerId/view",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <SellerProfile />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/:username/:sellerId",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Seller />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
      children: [
        {
          path: "seller_dashboard",
          element: <SellerDashboard />,
        },
        {
          path: "manage_orders",
          element: <ManageOrders />,
        },
        {
          path: "manage_earnings",
          element: <ManageEarnings />,
        },
      ],
    },

    {
      path: "reset_password",
      element: (
        <Suspense>
          <ResetPassword />
        </Suspense>
      ),
    },
    {
      path: "confirm_email",
      element: (
        <Suspense>
          <ConfirmEmail />
        </Suspense>
      ),
    },
    {
      path: "/manage_gigs/new/:sellerId",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <AddGig />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/manage_gigs/edit/:gigId",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <EditGig />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/gig/:username/:title/:sellerId/:gigId/view",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <GigView />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/categories/:category",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Gigs type="categories" />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/search/gigs",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Gigs type="search" />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/inbox",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Chat />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/inbox/:username/:conversationId",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Chat />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/gig/checkout/:gigId",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Checkout />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/gig/order/requirement/:gigId",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Requirement />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/orders/:orderId/activities",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Order />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "/:username/edit",
      element: (
        <Suspense>
          <ProtectedRoutes>
            <Layout backgroundColor="#ffffff">
              <Settings />
            </Layout>
          </ProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: "*",
      element: (
        <Suspense>
          <NotFound />
        </Suspense>
      ),
    },
  ];

  return useRoutes(routes);
};

export default AppRouter;
