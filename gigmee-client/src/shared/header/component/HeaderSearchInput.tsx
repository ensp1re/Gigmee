import { ChangeEvent, FC, FormEvent, ReactElement, useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  createSearchParams,
  NavigateFunction,
  useNavigate,
} from "react-router-dom";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/inputs/TextInput";

const HeaderSearchInput: FC = (): ReactElement => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate: NavigateFunction = useNavigate();

  const navigateToSearch = (): void => {
    const url = `/search/gigs?${createSearchParams({ query: searchTerm })}`;
    navigate(url);
  };

  return (
    <div className="mb-4 mt-1 flex h-10 w-full self-center opacity-100 md:mb-0 md:mt-0">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          navigateToSearch();
        }}
        className="flex w-full self-center border opacity-100"
      >
        <TextInput
          type="text"
          name="search"
          value={searchTerm}
          onChange={(e: ChangeEvent) => {
            const value = (e.target as HTMLInputElement).value;
            setSearchTerm(value);
          }}
          placeholder="What service are you looking for today?"
          className="w-full truncate px-4 py-[7.5px]"
        />
      </form>
      <Button
        onClick={navigateToSearch}
        disabled={!searchTerm}
        className="flex w-16 items-center justify-center bg-gray-900 text-white"
        label={<FaSearch className="h-6 w-6 fill-white text-white" />}
      />
    </div>
  );
};

export default HeaderSearchInput;
