import {
  ChangeEvent,
  FC,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import equal from "react-fast-compare";
import { FaCamera } from "react-icons/fa";
import BreadCrump from "src/shared/breadcrumb/BreadCrump";
import Button from "src/shared/button/Button";
import Dropdown from "src/shared/dropdown/DropDown";
import TextAreaInput from "src/shared/inputs/TextAreaInput";
import TextInput from "src/shared/inputs/TextInput";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import {
  GIG_MAX_LENGTH,
  IAllowedGigItem,
  ICreateGig,
  IShowGigModal,
} from "../../interfaces/gig.interface";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  categories,
  expectedGigDelivery,
  replaceSpacesWithDash,
  showErrorToast,
  showSuccessToast,
} from "src/shared/utils/utils.service";
import TagsInput from "./components/TagsInput";
import { checkImage, readAsBase64 } from "src/shared/utils/image-utils.service";
import { useGigSchema } from "../../hooks/useGigSchema";
import { gigInfoSchema } from "../../schemes/gig.schema";
import { IApprovalModalContent } from "src/shared/modals/interfaces/modal.interface";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import ApprovalModal from "src/shared/modals/ApprovalModal";
import { lowerCase } from "lodash";
import { useCreateGigMutation } from "../../service/gigs.service";
import PageLoader from "src/shared/pageloader/PageLoader";
import { IResponse } from "src/shared/shared.interface";
import { ISellerDocument } from "src/features/seller/interfaces/seller.interface";
import { addSeller } from "src/features/seller/reducers/seller.reducer";
import { updateHeader } from "src/shared/header/reducers/header.reducer";

const AddGig: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const quillRef = useRef<ReactQuill | null>(null);

  const defaultGigInfo: ICreateGig = {
    title: "",
    categories: "",
    description: "",
    subCategories: [],
    tags: [],
    price: 0,
    coverImage: "https://placehold.co/330x220?text=Profile+Image",
    expectedDelivery: "Expected Delivery",
    basicTitle: "",
    basicDescription: "",
  };

  const [gigInfo, setGigInfo] = useState<ICreateGig>(defaultGigInfo);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [subCategoryInput, setSubCategoryInput] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [allowedGigItemLength, setAllowedGigItemLength] =
    useState<IAllowedGigItem>({
      gigTitle: "80/80",
      basicTitle: "40/40",
      basicDescription: "100/100",
      descriptionCharacters: "1200/1200",
    });
  const [showGigModal, setShowGigModal] = useState<IShowGigModal>({
    image: false,
    cancel: false,
  });

  const gigInfoRef = useRef<ICreateGig>(defaultGigInfo);

  const [approvalModalContent, setApprovalModalContent] =
    useState<IApprovalModalContent>();
  const navigate: NavigateFunction = useNavigate();
  const { sellerId } = useParams();

  useEffect(() => {
    const reactQuillEditor = quillRef.current?.getEditor();
    if (reactQuillEditor) {
      reactQuillEditor.on("text-change", () => {
        if (reactQuillEditor.getLength() > GIG_MAX_LENGTH.fullDescription) {
          // Delete extra text which exceeds the limit
          reactQuillEditor.deleteText(
            GIG_MAX_LENGTH.fullDescription,
            reactQuillEditor.getLength(),
          );
        }
      });
    }
  }, [quillRef.current]);

  const [schemaValidation, _validationErrors] = useGigSchema({
    schema: gigInfoSchema,
    gigInfo,
  });

  const dispatch = useAppDispatch();
  const [createGig, { isLoading }] = useCreateGigMutation();

  const onCreateGig = async (): Promise<void> => {
    try {
      const isValid: boolean = await schemaValidation();
      if (isValid) {
        const gig: ICreateGig = {
          profilePicture: `${authUser.profilePicture}`,
          sellerId,
          title: gigInfo.title,
          categories: gigInfo.categories,
          description: gigInfo.description,
          subCategories: subCategories,
          tags,
          price: gigInfo.price,
          coverImage: gigInfo.coverImage,
          expectedDelivery: gigInfo.expectedDelivery,
          basicTitle: gigInfo.basicTitle,
          basicDescription: gigInfo.basicDescription,
        };
        const response: IResponse = await createGig(gig).unwrap();
        const updatedSeller: ISellerDocument = {
          ...seller,
          totalGigs: (seller.totalGigs as number) + 1,
        };
        dispatch(addSeller(updatedSeller));
        const title: string = replaceSpacesWithDash(gig.title);
        navigate(
          `/gig/${lowerCase(`${authUser.username}`)}/${title}/${response?.gig?.sellerId}/${response?.gig?.id}/view`,
        );
        showSuccessToast("Gig created successfully");
      }
    } catch (error) {
      console.log(error);
      showErrorToast("Error creating gig");
    }
  };

  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: ChangeEvent): Promise<void> => {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    if (target.files) {
      const file: File = target.files[0];
      const isValid = checkImage(file, "image");
      if (isValid) {
        const dataImage: string | ArrayBuffer | null = await readAsBase64(file);
        setGigInfo({
          ...gigInfo,
          coverImage: dataImage as string,
        });
        setShowGigModal({
          ...showGigModal,
          image: false,
        });
      }
    }
  };

  const onCancelCreate = (): void => {
    dispatch(updateHeader('sellerDashboard'));    
    navigate(-1);
  };

  return (
    <>
      {showGigModal.cancel && (
        <ApprovalModal
          approvalModalContent={approvalModalContent}
          onClose={() => setShowGigModal({ ...showGigModal, cancel: false })}
          onClick={onCancelCreate}
        />
      )}
      <div className="relative w-screen">
        <BreadCrump breadCrumbItems={["Seller", "Create new gig"]} />
        <div className="container relative mx-auto my-5 px-2 pb-12 md:px-0">
          {isLoading && <PageLoader />}

          {!authUser.emailVerified && (
            <div className="absolute left-0 top-0 z-[80] flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
              <span className="mt-40">Please verify your email.</span>
            </div>
          )}

          <div className="border-grey left-0 top-0 z-10 mt-4 block rounded border bg-white p-6">
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Gig title
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextInput
                  className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                  type="text"
                  name="gigTitle"
                  value={gigInfo.title}
                  placeholder="I will build something I'm good at."
                  maxLength={80}
                  onChange={(e: ChangeEvent) => {
                    setGigInfo({
                      ...gigInfo,
                      title: (e.target as HTMLInputElement).value,
                    });
                    const counter: number =
                      GIG_MAX_LENGTH.gigTitle -
                      (e.target as HTMLInputElement).value.length;
                    setAllowedGigItemLength({
                      ...allowedGigItemLength,
                      gigTitle: `${counter}/80`,
                    });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">
                  {allowedGigItemLength.gigTitle} Characters
                </span>
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Basic title
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextInput
                  className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                  placeholder="Write what exactly you'll do in short."
                  type="text"
                  name="basicTitle"
                  value={gigInfo.basicTitle}
                  maxLength={40}
                  onChange={(e: ChangeEvent) => {
                    setGigInfo({
                      ...gigInfo,
                      basicTitle: (e.target as HTMLInputElement).value,
                    });
                    const counter: number =
                      GIG_MAX_LENGTH.basicTitle -
                      (e.target as HTMLInputElement).value.length;
                    setAllowedGigItemLength({
                      ...allowedGigItemLength,
                      basicTitle: `${counter}/40`,
                    });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">
                  {allowedGigItemLength.basicTitle} Characters
                </span>
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Brief description
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextAreaInput
                  className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                  placeholder="Write a brief description..."
                  name="basicDescription"
                  value={gigInfo.basicDescription}
                  rows={5}
                  maxLength={100}
                  onChange={(e: ChangeEvent) => {
                    setGigInfo({
                      ...gigInfo,
                      basicDescription: (e.target as HTMLInputElement).value,
                    });
                    const counter: number =
                      GIG_MAX_LENGTH.basicDescription -
                      (e.target as HTMLInputElement).value.length;
                    setAllowedGigItemLength({
                      ...allowedGigItemLength,
                      basicDescription: `${counter}/100`,
                    });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">
                  {allowedGigItemLength.basicDescription} Characters
                </span>
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Full description
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <ReactQuill
                  ref={(e) => {
                    quillRef.current = e;
                  }}
                  onChange={(
                    value: string,
                    _,
                    __,
                    _editor: ReactQuill.UnprivilegedEditor,
                  ) => {
                    setGigInfo({
                      ...gigInfo,
                      description: value,
                    });
                    const counter: number =
                      GIG_MAX_LENGTH.fullDescription - value.length;
                    setAllowedGigItemLength({
                      ...allowedGigItemLength,
                      descriptionCharacters: `${counter}/1200`,
                    });
                  }}
                  theme="snow"
                  value={gigInfo.description}
                  className="border-grey border rounded"
                />

                <span className="flex justify-end text-xs text-[#95979d]">
                  {allowedGigItemLength.descriptionCharacters} Characters
                </span>
              </div>
            </div>
            <div className="mb-12 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Category
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="relative col-span-4 md:w-11/12 lg:w-8/12">
                <Dropdown
                  text={gigInfo.categories}
                  maxHeight="300"
                  mainClassNames="absolute bg-white z-50"
                  values={categories()}
                  onClick={(category: string) => {
                    setGigInfo({
                      ...gigInfo,
                      categories: category,
                    });
                  }}
                />
              </div>
            </div>

            <TagsInput
              title="Sub Categories"
              placeholder="E.g. Logo Design, Business Card Design"
              gigInfo={gigInfo}
              setGigInfo={setGigInfo}
              itemName="subCategories"
              tags={subCategories}
              itemInput={subCategoryInput}
              counterText="tags left"
              setItem={setSubCategories}
              setItemInput={setSubCategoryInput}
              inputErrorMessage={false}
            />

            <TagsInput
              title="Tags"
              placeholder="Enter search tags for your gig"
              gigInfo={gigInfo}
              setGigInfo={setGigInfo}
              itemName="tags"
              tags={tags}
              itemInput={tagsInput}
              counterText="tags left"
              setItem={setTags}
              setItemInput={setTagsInput}
              inputErrorMessage={false}
            />

            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Price
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextInput
                  type="number"
                  className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
                  placeholder="Enter minimum price"
                  name="price"
                  value={gigInfo.price}
                  onChange={(e: ChangeEvent) => {
                    const value: string = (e.target as HTMLInputElement).value;
                    setGigInfo({
                      ...gigInfo,
                      price: parseInt(value) > 0 ? parseInt(value) : 0,
                    });
                  }}
                />
              </div>
            </div>
            <div className="mb-12 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Expected delivery
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="relative col-span-4 md:w-11/12 lg:w-8/12">
                <Dropdown
                  text={gigInfo.expectedDelivery}
                  maxHeight="300"
                  mainClassNames="absolute bg-white z-40"
                  values={expectedGigDelivery()}
                  onClick={(delivery: string) => {
                    setGigInfo({
                      ...gigInfo,
                      expectedDelivery: delivery,
                    });
                  }}
                />
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="mt-6 pb-2 text-base font-medium lg:mt-0">
                Cover image
                <sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div
                onMouseEnter={() => {
                  setShowGigModal((item) => ({
                    ...item,
                    image: !item.image,
                  }));
                }}
                onMouseLeave={() => {
                  setShowGigModal((item) => ({
                    ...item,
                    image: false,
                  }));
                }}
                className="relative col-span-4 cursor-pointer md:w-11/12 lg:w-8/12"
                style={{ width: "320px", height: "220px" }} // Explicitly set width and height
              >
                {gigInfo.coverImage && (
                  <img
                    src={gigInfo.coverImage}
                    alt="Cover Image"
                    className="absolute left-0 top-0 h-full w-full bg-white object-cover" // Ensure img fills the parent container
                  />
                )}
                {!gigInfo.coverImage && (
                  <div className="absolute left-0 top-0 flex h-full w-full cursor-pointer justify-center bg-[#dee1e7]"></div>
                )}
                {showGigModal.image && (
                  <div
                    onClick={() => {
                      fileRef.current?.click();
                    }}
                    className="absolute left-0 top-0 flex h-full w-full cursor-pointer justify-center bg-[#dee1e7]"
                  >
                    <FaCamera className="flex self-center" />
                  </div>
                )}
                <TextInput
                  type="file"
                  ref={fileRef}
                  style={{ display: "none" }}
                  className="hidden"
                  onChange={handleFileChange}
                  name="image"
                  onClick={() => {
                    if (fileRef.current) {
                      fileRef.current.value = "";
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid xs:grid-cols-1 md:grid-cols-5">
              <div className="pb-2 text-base font-medium lg:mt-0"></div>
              <div className="col-span-4 flex gap-x-4 md:w-11/12 lg:w-8/12">
                <Button
                  disabled={isLoading}
                  className="rounded bg-green-500 px-8 py-3 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:py-3 md:text-base"
                  label="Create Gig"
                  onClick={onCreateGig}
                />
                <Button
                  disabled={isLoading}
                  onClick={() => {
                    const isEqual: boolean = equal(gigInfo, gigInfoRef.current);
                    if (!isEqual) {
                      setApprovalModalContent({
                        header: "Cancel Gig Creation",
                        body: "Are you sure you want to cancel?",
                        btnText: "Yes, Cancel",
                        btnColor: "bg-red-500 hover:bg-red-400",
                      });
                      setShowGigModal({ ...showGigModal, cancel: true });
                    } else {
                      onCancelCreate();
                    }
                  }}
                  className="rounded bg-red-500 px-8 py-3 text-center text-sm font-bold text-white hover:bg-red-400 focus:outline-none md:py-3 md:text-base"
                  label="Cancel"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddGig;
