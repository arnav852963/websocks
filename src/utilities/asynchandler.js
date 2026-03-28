import {ApiError} from "./ApiError.js";




export  const asyncHandler = (fun) => {

    return async (req, res, next) => {

        try {
            await fun(req, res, next);
        } catch (err) {

            console.log(err.message);
            res.status(500).json({ error: JSON.stringify(err), message: err.message , status: false , statusCode: err.statusCode || 500 });


        }
    }
}