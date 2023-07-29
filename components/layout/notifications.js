import React from "react";

const Notifier = ({ online }) => {
  const collectionArr = [...Array(3)];
  return (
    <div
      className={`mt-1 w-full ${online ? "bg-blue-50" : "bg-white"} rounded-lg`}
    >
      <div className="flex flex-row items-center">
        <div className="border-2 h-[75px] w-[75px] flex text-center items-center justify-center mx-auto rounded-lg overflow-hidden object-contain cursor-pointer shrink-0">
          Profile image
        </div>
        <div className="flex flex-col items-start ml-2">
          <div className="flex flex-row">
            <p>Name</p>
            <div className="flex flex-row px-3 items-center">
              {collectionArr.map((dot, index) => (
                <div
                  key={index}
                  className="bg-pink-500 h-[15px] w-[15px] mr-1 rounded-full object-contain flex items-center"
                ></div>
              ))}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="line-clamp-2 text-xs text-left text-gray-500 font-extralight w-36">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              gravida eros quis elit efficitur, ut interdum lacus consequat.
              Phasellus molestie felis non euismod finibus. Nunc sagittis
              venenatis metus a luctus. Sed dictum vulputate metus. Vestibulum
              ante ipsum primis in faucibus orci luctus et ultrices posuere
              cubilia curae; Nulla felis nibh, faucibus at tempus sit amet,
              rutrum ut felis. Phasellus pellentesque iaculis felis eu ultrices.
              Nullam semper dolor arcu, nec lobortis felis venenatis tincidunt.
              In hac habitasse platea dictumst. In hac habitasse platea
              dictumst. Aliquam accumsan rutrum tincidunt. Vivamus semper nibh
              volutpat bibendum mattis. Nullam sem tortor, vehicula at orci a,
              ultricies dapibus libero. Etiam sed enim libero.
            </div>
            <div
              className={`${
                !online ? "invisible" : null
              } bg-blue-500 h-[8px] w-[8px] rounded-full p-2 mr-2`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Notifications() {
  return (
    <div className="absolute shadow-2xl rounded-2xl right-14 p-3 top-12 bg-white border-2 max-h-[20rem] max-w-[22rem] z-10 overflow-x-hidden overflow-y-auto">
      <div className="flex flex-col items-center">
        <Notifier online={true} />
      </div>
    </div>
  );
}
