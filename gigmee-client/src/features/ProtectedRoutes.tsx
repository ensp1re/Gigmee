import { FC, ReactElement, ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import HomeHeader from "src/shared/header/component/HomeHeader";
import { saveToSessionStorage } from "src/shared/utils/utils.service";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import { addAuthUser } from "src/features/auth/reducers/auth.reducer";
import { useCheckCurrentUserQuery } from "src/features/auth/service/auth.service";
import { applicationLogout } from "src/features/auth/auth-utils/auth.utils";

export interface IProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<IProtectedRouteProps> = ({
  children,
}): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const showCategoryContainer = useAppSelector(
    (state: IReduxState) => state.showCategoryContainer,
  );
  const header = useAppSelector((state: IReduxState) => state.header);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data, isError, isLoading, status } = useCheckCurrentUserQuery(
    undefined,
    {
      skip: authUser.id === null,
    },
  );

  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (data && data.user) {
      setTokenIsValid(true);
      dispatch(addAuthUser({ authInfo: data.user }));
      saveToSessionStorage(
        JSON.stringify(true),
        JSON.stringify(authUser.username),
      );
    }

    if (isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [data, isError, dispatch, navigate, authUser.username]);

  if (isLoading || status === "pending") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-green-400" />
      </div>
    );
  }

  if (tokenIsValid || authUser) {
    return (
      <>
        {header && header === "home" && (
          <HomeHeader showCategoryContainer={showCategoryContainer} />
        )}
        {children}
      </>
    );
  }

  return (
    <>
      <Navigate to={"/not-found"} />
    </>
  );
};

export default ProtectedRoute;
