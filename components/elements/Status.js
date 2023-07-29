import { forwardRef } from "react";

const Status = forwardRef(function Status(
  { id, className, size, text, colour = "green-500" },
  ref
) {
  return (
    <div
      id={id}
      ref={ref}
      className={`rounded-full text-white bg-${colour} px-3 py-1 text-xs`}
    >
      {text}
    </div>
  );
});

export default Status;
