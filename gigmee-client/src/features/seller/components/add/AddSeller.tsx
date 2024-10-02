import {
  FC,
  FormEvent,
  lazy,
  LazyExoticComponent,
  ReactElement,
  useState,
} from "react";
import PageLoader from "src/shared/pageloader/PageLoader";
import { IBreadCrumbProps, IResponse } from "src/shared/shared.interface";
import PersonalInfo from "src/features/seller/components/add/components/PersonalInfo";
import {
  ICertificate,
  IEducation,
  IExperience,
  ILanguage,
  IPersonalInfoData,
  ISellerDocument,
} from "src/features/seller/interfaces/seller.interface";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import SellerExperienceFields from "src/features/seller/components/add/components/SellerExperienceFields";
import SellerEducationFields from "src/features/seller/components/add/components/SellerEducationField";
import SellerCertificateFields from "src/features/seller/components/add/components/SellerCertificateFields";
import SellerSocialLinksFields from "src/features/seller/components/add/components/SellerSocialLinksFields";
import Button from "src/shared/button/Button";
import SellerLanguageFields from "src/features/seller/components/add/components/SellerLanguagesFields";
import SellerSkillField from "src/features/seller/components/add/components/SellerSkillField";
import { useSellerSchema } from "src/features/seller/hooks/useSellerSchema";
import toast from "react-hot-toast";
import { filter, lowerCase } from "lodash";
import { useCreateSellerMutation } from "src/features/seller/service/seller.service";
import { IBuyerDocument } from "src/features/buyer/interfaces/buyer.interface";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { addSeller } from "src/features/seller/reducers/seller.reducer";
import { addBuyer } from "src/features/buyer/reducers/buyer.reducer";
import { FaSpinner } from "react-icons/fa";

const BreadCrump: LazyExoticComponent<FC<IBreadCrumbProps>> = lazy(
  () => import("src/shared/breadcrumb/BreadCrump"),
);

const AddSeller: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const buyer = useAppSelector((state: IReduxState) => state.buyer);

  const [personalInfo, setPersonalInfo] = useState<IPersonalInfoData>({
    fullName: "",
    oneliner: "",
    profilePicture: `${authUser.profilePicture}`,
    description: "",
    responseTime: "",
  });

  const isLoading = false;

  const [experienceFields, setExperienceFields] = useState<IExperience[]>([
    {
      title: "",
      description: "",
      startDate: "Start Date",
      company: "",
      endDate: "End Year",
      currentlyWorkingHere: false,
    },
  ]);

  const [educationFields, setEducationFields] = useState<IEducation[]>([
    {
      country: "Country",
      university: "",
      title: "Title",
      major: "",
      year: "Year",
    },
  ]);

  const [skillsFields, setSkillsFields] = useState<string[]>([""]);
  const [languageFields, setLanguageFields] = useState<ILanguage[]>([
    {
      language: "",
      level: "Level",
    },
  ]);
  const [certificateFields, setCertificateFields] = useState<ICertificate[]>([
    {
      name: "",
      from: "",
      year: "Year",
    },
  ]);

  const [socialFields, setSocialFields] = useState<string[]>([""]);

  const [
    schemaValidation,
    personalInfoErrors,
    experienceErrors,
    educationErrors,
    skillsErrors,
    languagesErrors,
  ] = useSellerSchema({
    personalInfo,
    experienceFields,
    languageFields,
    educationFields,
    skillsFields,
  });

  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const [createSeller, { isLoading: isCreating }] = useCreateSellerMutation();

  const onCreateSeller = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const isValid = await schemaValidation();
      if (!isValid) {
        toast.error("Please fill all required fields");
        return;
      }
      if (isValid) {
        // remove empty skills
        const skills: string[] = filter(
          skillsFields,
          (skill: string) => skill !== "",
        );
        const socialLinks: string[] = filter(
          socialFields,
          (item: string) => item !== "",
        );
        const certificates: ICertificate[] = certificateFields.map(
          (item: ICertificate) => {
            item.year = item.year === "Year" ? "" : item.year;
            return item;
          },
        );

        const sellerData: ISellerDocument = {
          email: authUser.email as string,
          profilePublicId: authUser.profilePublicId as string,
          profilePicture: personalInfo.profilePicture,
          fullName: personalInfo.fullName,
          description: personalInfo.description,
          oneliner: personalInfo.oneliner,
          country: authUser.country as string,
          skills,
          languages: languageFields,
          responseTime: parseInt(personalInfo.responseTime, 10),
          experience: experienceFields,
          education: educationFields,
          socialLinks,
          certificates,
        };

        const updateBuyer: IBuyerDocument = {
          ...buyer,
          isSeller: true,
        };

        const response: IResponse = await createSeller(sellerData).unwrap();
        dispatch(addSeller(response.seller));
        dispatch(addBuyer(updateBuyer));
        toast.success("Seller profile created successfully");

        navigate(`/seller_profile/${lowerCase(authUser.username as string)}/${response.seller?._id}/edit`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error creating seller profile");
    }
  };

  return (
    <div className="relative w-full">
      <BreadCrump breadCrumbItems={["Seller", "Create Profile"]} />
      <div className="container mx-auto my-5 overflow-hidden px-2 pb-12 md:px-0">
        {isLoading && <PageLoader />}

        {/* {authUser && !authUser.emailVerified && (
          <div className="absolute left-0 top-0 z-50 flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
            <span className="mt-20">Please verify your email.</span>
          </div>
        )} */}

        <div className="left-0 top-0 z-10 mt-4 block h-full bg-white">
          <PersonalInfo
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            personalInfoErrors={personalInfoErrors}
          />
          <SellerExperienceFields
            experienceFields={experienceFields}
            setExperienceFields={setExperienceFields}
            experienceErrors={experienceErrors}
          />
          <SellerEducationFields
            educationFields={educationFields}
            setEducationFields={setEducationFields}
            educationErrors={educationErrors}
          />
          <SellerSkillField
            skillsFields={skillsFields}
            setSkillsFields={setSkillsFields}
            skillsErrors={skillsErrors}
          />
          <SellerLanguageFields
            languageFields={languageFields}
            setLanguageFields={setLanguageFields}
            languagesErrors={languagesErrors}
          />
          <SellerCertificateFields
            certificatesFields={certificateFields}
            setCertificatesFields={setCertificateFields}
          />
          <SellerSocialLinksFields
            socialFields={socialFields}
            setSocialFields={setSocialFields}
          />
          <div className="flex justify-end p-6">
            <Button
              onClick={onCreateSeller}
              className="rounded bg-green-500 px-8 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:py-3 md:text-base"
              label={
                isCreating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Create Profile"
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSeller;
