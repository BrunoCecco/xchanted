import mongoose from 'mongoose';

const dmSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: true,
            },
        },
        users: Array,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            //ref: "User" -- if we ever make a mongoose for this
            required: true,
        },
    },
    {
        timestamps:true,
    },
);

module.exports = mongoose.model("DMs",dmSchema);