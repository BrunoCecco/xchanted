import React, { useState, useEffect } from 'react';
import { ChromePicker } from "react-color";

export default function InputColor({colour, setColour}) {
    const [displayColourPicker, setDisplayColourPicker] = useState(false);

    const handleChange = colour => setColour(colour.hex);

    return (
        <div className="flex flex-col items-center justify-center">
            <label className="font-semibold text-md mx-auto">
                Choose a colour!
            </label>
            <div
                style={{ background: colour}}
                className="w-10 h-10 rounded-full cursor-pointer border-4"
                onClick={() => setDisplayColourPicker(!displayColourPicker)}
            >
            </div>
            {displayColourPicker && (
                <div className="">
                    <ChromePicker color={colour} onChange={handleChange}/>
                </div>
            )}
        </div>
    )
}
