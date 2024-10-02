import {
  ChangeEvent,
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  useState,
} from "react";
import { FaEye, FaEyeSlash, FaSpinner, FaTimes } from "react-icons/fa";
import Alert from "src/shared/alert/Alert";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/inputs/TextInput";
import { IModalBgProps } from "src/shared/modals/interfaces/modal.interface";
import { ISignInPayload } from "src/features/auth/interfaces/auth.interface";
import { useAppDispatch } from "src/store/store";
import { useAuthSchema } from "src/features/auth/hooks/useAuthSchema";
import { loginUserSchema } from "src/features/auth/schemes/auth.scheme";
import { useSignInMutation } from "src/features/auth/service/auth.service";
import { IResponse } from "src/shared/shared.interface";
import { updateLogout } from "../reducers/logout.reducer";
import { saveToSessionStorage } from "src/shared/utils/utils.service";
import { addAuthUser } from "../reducers/auth.reducer";
import { updateCategoryContainer } from "src/shared/header/reducers/category.reducer";
import { updateHeader } from "src/shared/header/reducers/header.reducer";

const ModalBg: LazyExoticComponent<FC<IModalBgProps>> = lazy(
  () => import("src/shared/modals/ModalBg"),
);

const Login: FC<IModalBgProps> = ({
  onClose,
  onToggle,
  onTogglePassword,
}): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [userInfo, setUserInfo] = useState<ISignInPayload>({
    username: "",
    password: "",
    deviceType: "PC", // will be deleted after adding this func
    browserName: "Chrome", // will be deleted after adding this func,
  });
  const [passwordType, setPasswordType] = useState<string>("password");

  const dispatch = useAppDispatch();

  const [schemaValidation, validationErrors] = useAuthSchema({
    schema: loginUserSchema,
    userInfo,
  });
  const [signIn, { isLoading }] = useSignInMutation();

  const onLoginUser = async (): Promise<void> => {
    try {
      const isValid: boolean = await schemaValidation();
      if (isValid) {
        const response: IResponse = await signIn(userInfo).unwrap();
        setAlertMessage("");
        dispatch(updateLogout(false));
        dispatch(addAuthUser({ authInfo: response.user }));
        dispatch(updateCategoryContainer(true));
        dispatch(updateHeader("home"));
        saveToSessionStorage(
          JSON.stringify(true),
          JSON.stringify(response.user?.username?.toLowerCase()),
        );
      }
    } catch (error) {
      console.log(error);
      setAlertMessage(error?.data.message);
      console.log(validationErrors);
    }
  };

  return (
    <Suspense>
      <ModalBg>
        <div className="relative top-[20%] mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
          <div className="relative px-5 py-5">
            <div className="mb-5 flex justify-between text-2xl font-bold text-gray-600">
              <h1 className="flex w-full justify-center">Sign In to Gigmee</h1>
              <Button
                testId="closeModal"
                className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
                role="button"
                onClick={onClose}
                label={<FaTimes className="icon icon-tabler icon-tabler-x" />}
              />
            </div>
            {alertMessage && <Alert type="error" message={alertMessage} />}
            <div>
              <label
                htmlFor="email or username"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Email or username
              </label>
              <TextInput
                id="username"
                name="username"
                type="text"
                value={userInfo.username}
                onChange={(e: ChangeEvent) =>
                  setUserInfo({
                    ...userInfo,
                    username: (e.target as HTMLInputElement).value,
                  })
                }
                className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Password
              </label>
              <div className="relative mb-2 mt-2">
                <div className="absolute right-0 flex h-full cursor-pointer items-center pr-3 text-gray-600">
                  {passwordType === "password" ? (
                    <FaEyeSlash
                      onClick={() => setPasswordType("text")}
                      className="icon icon-tabler icon-tabler-info-circle"
                    />
                  ) : (
                    <FaEye
                      onClick={() => setPasswordType("password")}
                      className="icon icon-tabler icon-tabler-info-circle"
                    />
                  )}
                </div>
                <TextInput
                  id="password"
                  name="password"
                  type={passwordType}
                  value={userInfo.password}
                  onChange={(e: ChangeEvent) =>
                    setUserInfo({
                      ...userInfo,
                      password: (e.target as HTMLInputElement).value,
                    })
                  }
                  className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <div
                onClick={() => {
                  if (onTogglePassword) onTogglePassword(true);
                }}
                className="mb-6 ml-2 cursor-pointer text-sm text-green-600 hover:underline dark:text-green-500"
              >
                Forgot Password?
              </div>
            </div>
            <div className="flex w-full items-center justify-center">
              <Button
                testId="submit"
                disabled={!userInfo.username || !userInfo.password}
                onClick={onLoginUser}
                className={`text-md flex justify-center mt-5 w-full  rounded bg-green-500 px-8 py-2 text-center  font-bold text-white hover:bg-green-400 ${isLoading ? 'cursor-wait' : ''} focus:outline-none ${(!userInfo.username || !userInfo.password) ? "cursor-not-allowed" : "cursor-pointer"}`}
                label={
                  isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Login"
                  )
                }
              />
            </div>
          </div>
          <hr />
          <div className="px-5 py-4">
            <div className="ml-2 flex w-full justify-center text-sm font-medium">
              <div className="flex justify-center">
                Not yet a member?{" "}
                <p
                  onClick={() => {
                    if (onToggle) onToggle(true);
                  }}
                  className="ml-2 flex cursor-pointer text-green-600 hover:underline"
                >
                  Join Now
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBg>
    </Suspense>
  );
};

export default Login;
