export class ApiError extends Error{

    constructor(message = "Error Occur" , status , errors = []) {

        super(message)
        this.statusCode = status
        this.message = message
        this.errors = errors
    }


}