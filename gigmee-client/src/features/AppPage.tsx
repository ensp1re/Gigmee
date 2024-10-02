import { FC, ReactElement, useCallback, useEffect, useState } from "react";
import { Index } from "./index";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import { useCheckCurrentUserQuery } from "./auth/service/auth.service";
import { addAuthUser } from "./auth/reducers/auth.reducer";
import {
  capitalizeFirstLetter,
  getDataFromLocalStorage,
  saveToSessionStorage,
} from "src/shared/utils/utils.service";
import  Home from "src/features/home/home";
import HomeHeader from "src/shared/header/component/HomeHeader";
import { useNavigate } from "react-router-dom";
import { applicationLogout } from "./auth/auth-utils/auth.utils";
import { useGetBuyerByUsernameQuery } from "./buyer/service/buyer.service";
import { addBuyer } from "./buyer/reducers/buyer.reducer";
import { FaSpinner } from "react-icons/fa";
import { useGetSellerByUsernameQuery } from "./seller/service/seller.service";
import { addSeller } from "./seller/reducers/seller.reducer";
import { socket } from "src/sockets/socket.service";

const AppPage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const appLogout = useAppSelector((state: IReduxState) => state.logout);
  const showCategoryContainer = useAppSelector(
    (state: IReduxState) => state.showCategoryContainer,
  );
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    currentData: currentUser,
    isLoading: isCurrentDataLoading,
    isError,
  } = useCheckCurrentUserQuery(undefined, {
    skip: authUser.id === null,
  });

  const { currentData: buyer, isLoading: isBuyerLoading } =
    useGetBuyerByUsernameQuery(`${capitalizeFirstLetter(authUser?.username)}`, {
      skip: !authUser?.id || !tokenIsValid, // skip using the hook if the user is not authenticated
    });

  const { data: seller } = useGetSellerByUsernameQuery(
    `${capitalizeFirstLetter(authUser?.username)}`,
    {
      skip: !authUser?.id || !tokenIsValid, // skip using the hook if the user is not authenticated
    },
  );

  console.log(seller)

  // Combine loading states
  const isLoading = isCurrentDataLoading || isBuyerLoading;

  const checkUser = useCallback(() => {
    if (currentUser && currentUser.user && !appLogout) {
      setTokenIsValid(true);
      dispatch(addAuthUser({ authInfo: currentUser.user }));
      if (buyer?.user) {
        dispatch(addBuyer(buyer.user));
      }
      if (seller?.seller) {
        dispatch(addSeller(seller.seller));
      }
      saveToSessionStorage(
        JSON.stringify(true),
        JSON.stringify(authUser.username),
      );
      const becomeASeller: boolean = getDataFromLocalStorage('becomeASeller') as unknown as boolean;
      if (becomeASeller) {
        navigate('/seller_onboarding')
      }
      if (authUser.username !== null) {
        socket.emit('loggedInUsers', authUser?.username)
      }
    }
  }, [currentUser, appLogout, buyer, seller, authUser.username, dispatch]);

  const logoutUser = useCallback(() => {
    if ((!currentUser && appLogout) || isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [currentUser, appLogout, isError, dispatch, navigate]);

  useEffect(() => {
    checkUser();
    logoutUser();
  }, [checkUser, logoutUser]);

  // Render loading spinner if data is still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-green-400" />
      </div>
    );
  }

  // Render Index if token is not valid or no authUser id
  if (!tokenIsValid && !authUser?.id) {
    return <Index />;
  }

  // Render HomePage if token is valid
  return (
    <>
      <HomeHeader showCategoryContainer={showCategoryContainer} />
      <Home />
    </>
  );
};

export default AppPage;
