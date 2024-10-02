import { FC, ReactElement } from "react";
import { Link } from "react-router-dom";

const NotFound: FC = (): ReactElement => {
  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center">
      <div className="container flex flex-col md:flex-row items-center justify-between px-5 text-gray-700">
        <div className="w-full lg:w-1/2 mx-8">
          <div className="text-7xl text-green-500 font-dark font-extrabold mb-8">
            {" "}
            404
          </div>
          <p className="text-2xl md:text-3xl font-light leading-normal mb-8">
            Sorry we couldn't find the page you're looking for
          </p>

          <Link
            to="/"
            className="px-5 inline py-3 text-sm font-medium leading-5 shadow-2xl text-white transition duration-400 border border-transparent rounded-lg focus:outline-none bg-green-600 active:bg-green-300 hover:bg-green-700"
          >
            back to homepage
          </Link>
        </div>
        <div className="w-full lg:flex lg:justify-end lg:w-1/2 mx-5 my-12">
          <img
            src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
            alt="Page not found"
          />
        </div>
      </div>
    </div>
  );

  // <main classNameName="flex items-center justify-center w-full min-h-screen py-8 text-gray-900 page md:py-16 ">
  //   <div classNameName="relative flex flex-col items-center w-full gap-8 px-8 md:px-18 xl:px-40 md:gap-16">
  //     <h1 classNameName="text-9xl md:text-[300px] w-full select-none  text-center font-black  text-gray-400">
  //       404
  //     </h1>
  //     <p classNameName="text-3xl font-bold capitalize ">
  //       You have discovegreen a secret place
  //     </p>
  //     <p classNameName="text-2xl font-medium break-words text-dull">
  //       Unfortunately, this is only a 404 page. You may have mistyped the
  //       address, or the page has been moved to another URL.
  //     </p>
  //     <div classNameName="flex flex-col justify-between w-full gap-8 md:flex-row md:gap-32 xl:px-16">
  //       <a
  //         onClick={() => navigate(-1)}
  //         classNameName="flex items-center cursor-pointer justify-center w-full gap-4 p-3 font-semibold capitalize border-2 border-green-500 transition 300 rounded shadow-lg md:w-fit hover:bg-green-500 md:p-6 focus:outline-none hover:scale-105 active:scale-90 hover:shadow-xl "
  //       >
  //         <span classNameName="rotate-180 material-symbols-outlined">
  //           <FaArrowRight />
  //         </span>
  //         Go back to Previous Page
  //       </a>
  //       <a
  //         href="/"
  //         classNameName="rounded flex w-full cursor-pointer md:w-fit group items-center gap-4 justify-center border-2 border-green-500 font-semibold hover:bg-green-500 p-3 md:p-6 capitalize focus:outline-none hover:scale-105 active:scale-90 shadow-lg hover:shadow-xl "
  //       >
  //         <span classNameName="material-symbols-outlined">
  //           <FaHome />
  //         </span>
  //         Go back to Home Page
  //       </a>
  //     </div>
  //   </div>
  // </main>
};

export default NotFound;
