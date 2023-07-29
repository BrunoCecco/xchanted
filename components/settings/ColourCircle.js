import { forwardRef } from "react";
import { MdCheck } from "react-icons/md";

const ColourCircle = forwardRef(function ColourCircle(
  { id, onClick, colour, selected },
  ref
) {
  return (
    <button
      className="mx-auto block rounded-full hover:scale-110 transition transform duration-200 ease-out w-12 h-12"
      style={{ backgroundImage: colour, background: colour }}
      onClick={onClick}
    >
      {selected && (
        <MdCheck
          className="absolute z-10 p-2 rounded-full h-12 w-12"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color:
              colour.includes("#fff") || colour[0].includes("#fff")
                ? "#473be8"
                : "white",
            border:
              colour.includes("#fff") || colour[0].includes("#fff")
                ? "2px solid #473be8"
                : "2px solid transparent",
          }}
        />
      )}
    </button>
  );
});

export default ColourCircle;
