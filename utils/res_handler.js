exports.send_res = async (res, status, message) => {
    res
        .status(status)
        .json(message)
}