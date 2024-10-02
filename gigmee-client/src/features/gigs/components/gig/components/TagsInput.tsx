import { ChangeEvent, FC, KeyboardEvent, ReactElement, useState } from "react";
import { ITagsInputProps } from "src/features/gigs/interfaces/gig.interface";
import TextInput from "src/shared/inputs/TextInput";
import { v4 as uuidv4 } from "uuid";

const TagsInput: FC<ITagsInputProps> = (props): ReactElement => {
  const {
    title,
    placeholder,
    gigInfo,
    tags,
    itemInput,
    itemName,
    setItem,
    setItemInput,
    setGigInfo,
    counterText,
  } = props;

  const [isKeyReleased, setIsKeyReleased] = useState<boolean>(false);

  const maxTagCount = 10;

  const onChange = (e: ChangeEvent): void => {
    const { value } = e.target as HTMLInputElement;
    setItemInput(value);
  };

  const onKeyUp = (): void => {
    setIsKeyReleased(true);
  };

  const onKeyDown = (
    e: KeyboardEvent,
    input: string,
    tagsList: string[],
  ): void => {
    const { key } = e;
    // remove white spaces
    const trimmedInput: string = input.trim();
    if (!trimmedInput) return;
    // check if the key pressed is enter
    if (tagsList.length + 1 <= maxTagCount) {
      if (
        trimmedInput.length &&
        (key === "," || key === 'Enter') &&
        !tagsList.includes(trimmedInput)
      ) {
        e.preventDefault();
        setItem((prev: string[]) => [...prev, trimmedInput]);
        setItemInput("");
        const gigInfoList: string[] = gigInfo[`${itemName}`] as string[];
        setGigInfo({
          ...gigInfo,
          [`${itemName}`]: [...gigInfoList, trimmedInput],
        });
      }
    }

    if (
      key === "Backspace" &&
      !input.length &&
      tagsList.length &&
      isKeyReleased
    ) {
      const tagsListCopy: string[] = [...tagsList];
      const poppedTag: string = tagsListCopy.pop() as string;
      e.preventDefault();
      setItem(tagsListCopy);
      setItemInput(poppedTag);
      setGigInfo({ ...gigInfo, [`${itemName}`]: tagsListCopy });
    }
  };

  const deleteTag = (index: number): void => {
    setItem((prev: string[]) => {
      const filteredTags: string[] = prev.filter(
        (_: string, i: number) => i !== index,
      );
      return filteredTags;
    });
    const gigInfoList: string[] = gigInfo[`${itemName}`] as string[];
    setGigInfo({
      ...gigInfo,
      [`${itemName}`]: gigInfoList.filter(
        (_: string, i: number) => i !== index,
      ),
    });
  };

  return (
    <div className="mb-6 grid md:grid-cols-5">
      <div className="mt-6 pb-2 text-base font-medium lg:mt-0">
        {title}
        <sup className="top-[-0.3em] text-base text-red-500">*</sup>
      </div>
      <div className="col-span-4 md:w-11/12 lg:w-8/12">
        <div className="flex w-full flex-wrap py-[4px]">
          {tags.map((tag: string, index: number) => (
            <div
              onClick={() => deleteTag(index)}
              key={uuidv4()}
              className="my-[2px] mr-1 flex items-center whitespace-nowrap rounded-[50px] bg-green-500 px-4 text-sm font-bold text-white"
            >
              {tag}
              <span className="flex cursor-pointer p-[6px] text-white">x</span>
            </div>
          ))}
        </div>
        <TextInput
          type="text"
          name={title}
          value={itemInput}
          onChange={(e: ChangeEvent) => onChange(e)}
          onKeyDown={(e: KeyboardEvent) => onKeyDown(e, itemInput, tags)}
          onKeyUp={onKeyUp}
          className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
          placeholder={placeholder}
        />
        <span className="flex justify-end text-xs text-[#95979d]">
          {maxTagCount - tags.length} {counterText}
        </span>
      </div>
    </div>
  );
};

export default TagsInput;
