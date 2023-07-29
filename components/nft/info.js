import Image from "next/image";
import Script from "next/script";
import Comments from "./comments";

export default function Info({ nft, close }) {
  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      ></Script>
      <div className="absolute mx-auto left-0 right-0 w-5/6 h-4/6 shadow-lg rounded-md bg-white z-20">
        <div className="grid grid-cols-2 text-center leading-6 w-full h-full">
          <div className="p-5">
            {nft.metadata.image && (
                <>
                  {nft.metadata.type == "v" ||
                  nft.metadata.image.indexOf("mp4") > -1 ||
                  nft.metadata.image.indexOf("webm") > -1 ? (
                    <video
                      autoPlay
                      muted
                      loop
                      style={{ width: "100%" }}
                    >
                      <source src={nft.metadata.animation ? nft.metadata.animation : nft.metadata.image} />
                    </video>
                  ) : (
                    <>
                      {!nft.metadata.animation || (nft.metadata.type && nft.metadata.type == "i") ? 
                      (
                        <div style={{ height: "100%" }}>
                          <img
                            src={nft.metadata.imgopti ? nft.metadata.imgopti : nft.metadata.image }
                            alt={nft.metadata.name}
                          />
                        </div>
                      ) : (
                        <>
                        {nft.metadata.animation.indexOf(".glb") != -1 ? (
                          <model-viewer
                            class="h-full m-auto"
                            alt={nft.metadata.name}
                            poster={nft.metadata.image}
                            ar-status="not-presenting"
                            src={nft.metadata.animation}
                            autoplay="true"
                            camera-controls="true"
                            auto-rotate="true"
                          ></model-viewer>
                      ) : (
                        <iframe
                          width="100%"
                          height="100%"
                          src={nft.metadata.animation}
                        ></iframe>
                        )}
                        </>
                      )}
                      
                    </>
                  )}
                </>
              )}
          </div>
          <div className="p-5">
            <div className="text-lg leading-6 font-medium text-gray-900">
              {nft.metadata.name}
            </div>
            <div className="text-sm text-justify text-gray-500 h-60 overflow-auto">
              {nft.metadata.description}
            </div>
            <Comments nft={nft} />
          </div>
          <div className="col-span-2 p-5 flex flex-row flex-wrap overflow-auto ">
            {nft.metadata.traits &&
              nft.metadata.traits.map((item, index) => (
                <div key={index} className="m-1 w-36 border-2 rounded-md ">
                  {nft.chain == 2 ? (
                    <>
                      <div className="text-md font-bold">{item}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">{item.trait_type}</div>
                      <div className="text-md font-bold">{item.value}</div>
                    </>
                  ) }

                </div>
              ))}
          </div>
        </div>
      </div>
      <div
        onClick={close}
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-10"
      ></div>
    </>
  );
}
