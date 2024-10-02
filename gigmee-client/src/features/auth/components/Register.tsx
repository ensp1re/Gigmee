import {
  ChangeEvent,
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  useRef,
  useState,
} from "react";
import {
  FaCamera,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import Alert from "src/shared/alert/Alert";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/inputs/TextInput";
import { IModalBgProps } from "src/shared/modals/interfaces/modal.interface";
import { ISignUpPayload } from "src/features/auth/interfaces/auth.interface";
import { IDropdownProps, IResponse } from "src/shared/shared.interface";
import {
  countriesList,
  saveToSessionStorage,
} from "src/shared/utils/utils.service";
import userDefaultLogo from "src/assets/user-avatar.png";
import { checkImage, readAsBase64 } from "src/shared/utils/image-utils.service";
import { useAuthSchema } from "src/features/auth/hooks/useAuthSchema";
import { registerUserSchema } from "src/features/auth/schemes/auth.scheme";
import { useSignUpMutation } from "src/features/auth/service/auth.service";
import { useAppDispatch } from "src/store/store";
import { addAuthUser } from "src/features/auth/reducers/auth.reducer";
import { updateLogout } from "../reducers/logout.reducer";
import { updateCategoryContainer } from "src/shared/header/reducers/category.reducer";
import { updateHeader } from "src/shared/header/reducers/header.reducer";

const Dropdown: LazyExoticComponent<FC<IDropdownProps>> = lazy(
  () => import("src/shared/dropdown/DropDown"),
);
const ModalBg: LazyExoticComponent<FC<IModalBgProps>> = lazy(
  () => import("src/shared/modals/ModalBg"),
);

const Register: FC<IModalBgProps> = ({ onClose, onToggle }): ReactElement => {
  const [step, setStep] = useState<number>(1);
  const [country, setCountry] = useState<string>("Select Country");
  const [userInfo, setUserInfo] = useState<ISignUpPayload>({
    username: "",
    password: "",
    email: "",
    country: "",
    profilePicture: "",
    deviceType: "PC", // will be deleted after adding this func
    browserName: "Chrome", // will be deleted after adding this func,
  });
  const [profileImage, setProfileImage] = useState<string>(userDefaultLogo);
  const [showImageSelect, setShowImageSelect] = useState<boolean>(false);
  const [passwordType, setPasswordType] = useState<string>("password");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schemaValidation] = useAuthSchema({
    schema: registerUserSchema,
    userInfo: userInfo,
  });

  const dispatch = useAppDispatch();

  const [signUp, { isLoading }] = useSignUpMutation();

  const handleFileChange = async (e: ChangeEvent): Promise<void> => {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    if (target.files) {
      const file: File = target.files[0];
      const isValid = checkImage(file, "image");
      if (isValid) {
        const dataImage: string | ArrayBuffer | null = await readAsBase64(file);
        setProfileImage(`${dataImage}`);
        setUserInfo({
          ...userInfo,
          profilePicture: profileImage,
        });
      }
      setShowImageSelect(false);
    }
  };

  const onRegisterUser = async (): Promise<void> => {
    try {
      const isValid: boolean = await schemaValidation();
      if (isValid) {
        const response: IResponse = await signUp(userInfo).unwrap();
        console.log(response);
        setAlertMessage("");
        dispatch(addAuthUser({ authInfo: response?.user }));
        dispatch(updateLogout(false));
        dispatch(updateCategoryContainer(true));
        dispatch(updateHeader("home"));
        saveToSessionStorage(
          JSON.stringify(true),
          JSON.stringify(response.user?.username),
        );
      }
    } catch (error) {
      console.log(error);
      setAlertMessage(error?.data.message);
    }
  };

  return (
    <ModalBg>
      <div className="relative top-[10%] mx-auto w-11/12 max-w-md rounded bg-white md:w-2/3">
        <div className="relative px-5 py-5">
          <div className="flex justify-between text-2xl font-bold text-gray-600">
            {step > 1 && (
              <Button
                className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
                role="button"
                onClick={() => setStep(step - 1)}
                label={
                  <FaChevronLeft className="icon icon-tabler icon-tabler-x" />
                }
              />
            )}
            <h1 className="flex w-full justify-center">Join Gigmee</h1>
            <Button
              className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
              role="button"
              onClick={onClose}
              label={<FaTimes className="icon icon-tabler icon-tabler-x" />}
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-5 py-5">
          <ol className="flex w-full">
            <li className="flex w-full items-center text-white after:inline-block after:h-1 after:w-full after:border-4 after:border-b after:border-green-500 after:content-[''] dark:after:border-green-500">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold dark:bg-green-500 lg:h-12 lg:w-12">
                1
              </span>
            </li>
            <li className="flex justify-center text-center">
              <span
                className={`${step === 2 ? "bg-green-500 dark:bg-green-500" : "bg-green-300/50 dark:bg-green-300/50"} flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white lg:h-12 lg:w-12`}
              >
                2
              </span>
            </li>
          </ol>
        </div>
        <div className="px-5">
          {alertMessage && <Alert type="error" message={alertMessage} />}
        </div>

        {step === 1 && (
          <div className="relative px-5 py-5">
            <div>
              <label
                htmlFor="username"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Username
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
                className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-green-500/50 focus:outline-none"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Email
              </label>
              <TextInput
                id="email"
                name="email"
                type="email"
                value={userInfo.email}
                onChange={(e: ChangeEvent) =>
                  setUserInfo({
                    ...userInfo,
                    email: (e.target as HTMLInputElement).value,
                  })
                }
                className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-green-500/50 focus:outline-none"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Password
              </label>
              <div className="relative mb-5 mt-2">
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
                  className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-green-500/50 focus:outline-none"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <Button
              disabled={
                !userInfo.username || !userInfo.email || !userInfo.password
              }
              className={`text-md block w-full cursor-pointer rounded bg-green-500 px-8 py-2 text-center font-bold text-white hover:bg-green-400 focus:outline-none ${!userInfo.username || !userInfo.email || !userInfo.password ? "cursor-not-allowed" : "cursor-pointer"}`}
              label="Continue"
              onClick={() => setStep(2)}
            />
          </div>
        )}
        {step === 2 && (
          <div className="relative px-5 py-5">
            <div className="h-24">
              <label
                htmlFor="country"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Country
              </label>
              <div id="country" className="relative mb-5 mt-2">
                <Suspense>
                  <Dropdown
                    text={country}
                    maxHeight="200"
                    mainClassNames="absolute z-50 bg-white"
                    showSearchInput={true}
                    values={countriesList()}
                    setValue={setCountry}
                    onClick={(item: string) => {
                      setCountry(item);
                      setUserInfo({
                        ...userInfo,
                        country: item,
                      });
                    }}
                  />
                </Suspense>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="profilePicture"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Profile Picture
              </label>
              <div
                onMouseEnter={() => setShowImageSelect(true)}
                onMouseLeave={() => setShowImageSelect(false)}
                className="relative rounded-full w-20 h-20 cursor-pointer overflow-hidden"
              >
                {profileImage ? (
                  <img
                    id="profilePicture"
                    src={profileImage}
                    alt="Profile Picture"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#dee1e7] rounded-full">
                    {/* Optionally, you can add a placeholder icon here */}
                  </div>
                )}
                {showImageSelect && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-[#dee1e7] rounded-full opacity-60 cursor-pointer"
                  >
                    <FaCamera className="text-gray-600" />
                  </div>
                )}
                <input
                  className="hidden"
                  name="image"
                  type="file"
                  ref={fileInputRef}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <Button
              disabled={!userInfo.country || !userInfo.profilePicture}
              onClick={onRegisterUser}
              className={`text-md flex justify-center mt-5 w-full cursor-pointer rounded bg-green-500 px-8 py-2 text-center  font-bold text-white hover:bg-green-400 focus:outline-none ${!userInfo.profilePicture || !userInfo.country ? "cursor-not-allowed" : "cursor-pointer"}`}
              label={
                isLoading ? <FaSpinner className="animate-spin" /> : "Register"
              }
            />
          </div>
        )}
        <hr />

        <div className="px-5 py-4">
          <div className="ml-2 flex w-full justify-center text-sm font-medium">
            <div className="flex justify-center">
              Already a member?{" "}
              <p
                onClick={() => {
                  if (onToggle) onToggle(true);
                }}
                className="ml-2 flex cursor-pointer text-green-600 hover:underline"
              >
                Sign In
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalBg>
  );
};

export default Register;
